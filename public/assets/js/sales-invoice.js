const getLastSInvoiceID = async () => {
    let response =  await fetch("/api/salesInvoice/lastID", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }      
    });
    let idDate = await response.json();
    return idDate.data[0].lITRecId;
}

const getSaleOrders = async () => {
    let response = await fetch("/api/salesOrder/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return await response.json();
}

const getSaleOrdersByCustomer = async (id) => {
    let response = await fetch(`/api/salesOrder/byCustomer/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return await response.json();
}

const getSaleOrder = async (id) => {
    let response = await fetch(`/api/salesOrder/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return await response.json();
}

const loadSaleOrders = (orders) => {
    // console.log(orders);
    orders.data.forEach(order => {
        $('#orderSelect').append(`<option value="${order.lId}">${order.sSONum}</option>`);
    });
}

const loadSaleOrder = async (orderData) => {
    console.log(orderData);
    const mainOrder = orderData.data[0];
    $('#subjects').val(mainOrder.lCusId);

    await selectCustomer(mainOrder.lCusId).then(updateOrderOptions(mainOrder.lCusId));

    const shipping = [
        mainOrder.sShipTo1, mainOrder.sShipTo2, mainOrder.sShipTo3,
        mainOrder.sShipTo4, mainOrder.sShipTo5, mainOrder.sShipTo6
    ];
    $('.shipTo').find('input').each(function(){
        $(this).val(shipping.shift());
    });

    $('#shipDate').val(mainOrder.dtShipDate);
    $('#salesPerson').val(mainOrder.lSoldBy);
    $('#locations').val(mainOrder.lInvLocId);
    $('#message').val(mainOrder.sComment);

    $('#itemsBody').html('');

    const loadItem = async(index) => {
        await addRow().then(async ()=>{
            const row = $('.itemsRow').last();
            row.find('.itemSelect').val(orderData.data[index].lInventId);      
            row.find('.orderNum').val(orderData.data[index].dOrdered);      
            row.find('.bOrderNum').val(orderData.data[index].dRemaining);      
            row.find('.unitNum').val(orderData.data[index].sUnits);      
            row.find('.descSelect').val(orderData.data[index].lInventId);      
            row.find('.priceNum').val(orderData.data[index].dPrice);      
            row.find('.taxNum').val(orderData.data[index].lTaxCode);      
            // row.find('.amountNum').val(orderData.data[index].dAmount);

            let acctNum = orderData.data[index].lAcctId.toString();
            acctNum = acctNum.substring(0, acctNum.length - 4);
            acctNum = parseInt(acctNum);
    
            let accountNum = row.find('.accountNum');
    
            accountNum.val(`${acctNum} ${orderData.data[index].accountName}`);
            accountNum.prop('title', `${acctNum} ${orderData.data[index].accountName}`);

            row.find('.itemSelect').prop('disabled', true);
            row.find('.descSelect').prop('disabled', true);
            row.find('.itemSelect').addClass('readOnly');
            row.find('.descSelect').addClass('readOnly');

            row.find('.bOrderNum').prop('readonly', false);
            row.find('.bOrderNum').removeClass('readOnly');

            await updateTax(row.find('.taxNum'));

            index = index + 1;
            if(index < orderData.data.length){
                if(orderData.data[index].bFreight === 0){
                    loadItem(index);
                }else{
                    addRow();
                    $('#freight').val(orderData.data[index].dAmount);
                    $('.freight-tax').val(orderData.data[index].lTaxCode);
                    await updateTax($('.freight-tax'));
                    updateTotals();
                }
            }
        });
    }

    loadItem(0);
}

const updateTax = async (elem) =>{
    let taxCode = elem.val();
    let gst;
    let pst;
    let amount;
    let isFreight = false;

    if(elem.hasClass('taxNum')){
        let row = elem.parent().parent();
        gst = row.find('.gstNum');
        pst = row.find('.pstNum');
        amount = row.find('.amountNum').val();
    }else if(elem.hasClass('freight-tax')){
        isFreight = true;
        gst = $('#freightGST');
        pst = $('#freightPST');
        amount = $('#freight').val();
    }

    const selectedTax = await getTaxInfo(taxCode);

    if(selectedTax.length === 1){
        if(isFreight){
            pst.prop('readonly', true);
            pst.addClass('readOnly');
        }
        pst.val('');
    }

    selectedTax.forEach(taxType=>{
        if(taxType.lTaxAuth === 1){
            if(taxType.dPct > 0){
                if(isFreight){
                    gst.prop('readonly', false);
                    gst.removeClass('readOnly');
                }
                gst.val(Math.round((amount*(taxType.dPct/100)) * 100)/100);
            }else{
                if(isFreight){
                    gst.prop('readonly', true);
                    gst.addClass('readOnly');
                }
                gst.val('');
            }
        }else if(taxType.lTaxAuth === 2){
            if(taxType.dPct > 0){
                if(isFreight){
                    pst.prop('readonly', false);
                    pst.removeClass('readOnly');
                }
                pst.val(Math.round((amount*(taxType.dPct/100)) * 100)/100);
            }else{
                if(isFreight){
                    pst.prop('readonly', true);
                    pst.addClass('readOnly');
                }
                pst.val('');
            }
        }else{
            if(isFreight){
                gst.prop('readonly', true);
                gst.addClass('readOnly');
            }
            gst.val('');
            if(isFreight){
                pst.prop('readonly', true);
                pst.addClass('readOnly');
            }
            pst.val('');
        }
    });
    updateTotals();
}

const addRow = async () => {
    $('#itemsBody').append(`<tr class="itemsRow">
        <td class="item"><select name="item" class="itemSelect" autocomplete="on">
        <option value="" selected=""></option>
        </select></td>
        <td class="quantity"><input name="quantityNum" class="quantityNum" type="number" min="0" title="Stock Quantity"></td>
        <td class="order"><input name="orderNum" type="number" min="0" readonly class="orderNum readOnly"></td>
        <td class="bOrder"><input name="bOrderNum" type="number" min="0" readonly class="bOrderNum readOnly"></td>
        <td class="unit"><input name="unitNum" class="unitNum"></td>
        <td class="description"><select name="desc" class="descSelect" autocomplete="on">
        <option value="" selected=""></option>
        </select></td>
        <td class="price"><input name="priceNum" type="number" step="0.00000000000001" min="0" class="priceNum"></td>
        <td class="tax"><select name="taxNum" class="taxNum" autocomplete="on"></select></td>
        <td class="gst"><input name="gstNum" type="number" step="0.01" min="0" class="gstNum readOnly" readonly></td>
        <td class="pst"><input name="pstNum" type="number" step="0.01" min="0" class="pstNum readOnly" readonly></td>
        <td class="amount"><input name="amountNum" type="number" step="0.01" min="0" class="amountNum"></td>
        <td class="account"><input name="accountNum" class="accountNum readOnly" readonly title="Account"></td>
    </tr>`);
    await initItems($('.itemsRow').last());
    await initTax($('.itemsRow').last());
    await loadAccount($('.itemsRow').last());
};

const submitOrder = async () => {
    // Get customer
    const customer = await getCustomer($('#subjects').val());

    // Get shipping address fields
    let shipTo = [];
    $('.shipTo').find('input').each(function(){
        shipTo.push($(this).val());
    });    

    // Get items per row
    let items = [];
    let gstTotalRef = 0;
    let gstTotalNonRef = 0;
    let pstTotalRef = 0;
    let pstTotalNonRef = 0;

    let quantityExists = false;

    $('.itemsRow').each(async function(){
        if($(this).find('.itemSelect').val()){
            // Get item by id
            const item = await getItem($(this).find('.itemSelect').val());

            let gstNum = parseFloat($(this).find('.gstNum').val());
            let pstNum = parseFloat($(this).find('.pstNum').val());
            if(isNaN(gstNum)) gstNum = 0;
            if(isNaN(pstNum)) pstNum = 0;

            // Get total tax amount
            let taxAmt = 0;
            if($(this).find('.gstNum').val()) taxAmt = taxAmt + gstNum;
            if($(this).find('.pstNum').val()) taxAmt = taxAmt + pstNum;
            taxAmt = Math.round(taxAmt * 100)/100;            

            const selectedTax = await getTaxInfo($(this).find('.taxNum').val());
            if(selectedTax[0].bRefundbl === 1){
                gstTotalRef = gstTotalRef + gstNum;
                pstTotalRef = pstTotalRef + pstNum;
            }else{
                gstTotalNonRef = gstTotalNonRef + gstNum;
                pstTotalNonRef = pstTotalNonRef + pstNum;
            }

            let defaultPrice = 0;
            let userPrice = $(this).find('.priceNum').val();

            if(item.dLastPPrce == userPrice){
                defaultPrice = 1;
            }

            let quantity = $(this).find('.quantityNum').val();
            if(!quantityExists && quantity > 0){
                quantityExists = true;
            }

            // Create user input object
            const userInput = {
                quantity: quantity,
                orderQuantity: $(this).find('.orderNum').val(),
                backOrderQuantity: $(this).find('.bOrderNum').val(),
                taxCode: $(this).find('.taxNum').val(),
                taxAmt: taxAmt,
                gst: gstNum,
                pst: pstNum,
                amount: $(this).find('.amountNum').val(),
                price: userPrice,
                bDefPrice: defaultPrice
            };

            // Add user input to item object, push item object to items array
            item.userInput = userInput;
            item.lineNum = items.length + 1;
            items.push(item);
        }
    });

    let freightGstNum = parseFloat($('#freightGST').val());
    let freightPstNum = parseFloat($('#freightPST').val());
    if(isNaN(freightGstNum)) freightGstNum = 0;
    if(isNaN(freightPstNum)) freightPstNum = 0;

    const selectedTax = await getTaxInfo($('.freight-tax').val());
    if(selectedTax[0].bRefundbl === 1){
        gstTotalRef = gstTotalRef + freightGstNum;
        pstTotalRef = pstTotalRef + freightPstNum;
    }else{
        gstTotalNonRef = gstTotalNonRef + freightGstNum;
        pstTotalNonRef = pstTotalNonRef + freightPstNum;
    }

    // Get freight tax amount total
    let freightTaxAmt = 0;
    if($('#freightGST').val()) freightTaxAmt = freightTaxAmt + freightGstNum;
    if($('#freightPST').val()) freightTaxAmt = freightTaxAmt + freightPstNum;
    freightTaxAmt = Math.round(freightTaxAmt * 100)/100;

    let lastID = await getLastSInvoiceID();
    let newID = lastID + 1;

    let newJEntID = 0;
    if(quantityExists){
        let lastJEntID = await getLastJEntID();
        newJEntID = lastJEntID + 1;
    }

    let bFromPO = 0;
    if($('#orderSelect').val()){
        bFromPO = 1;
    }

    const data = { 
        newID: newID,
        newJEntID: newJEntID,
        customer: customer, 
        shipTo: shipTo, 
        bFromPO: bFromPO,
        orderSelect: $('#orderSelect').val(),
        orderSelectName: $('#orderSelect option:selected').text(),
        orderNum: $('#orderNum').val().replace(/\s+/g, ''), 
        orderDate: $('#orderDate').val(), 
        shipDate: $('#shipDate').val(), 
        locationID: $('#locations').val(), 
        salesManID: $('#salesPerson').val(),
        salesManName: $("#salesPerson option:selected").text(),
        items: items,
        freightAmt: $('#freight').val(),
        freightTaxCode: $('.freight-tax').val(),
        freightTaxAmt: freightTaxAmt,
        freightGST: freightGstNum,
        freightPST: freightPstNum,
        totalAmt: $('#total').val(),
        gstTotalRef: Math.round(gstTotalRef * 100)/100,
        gstTotalNonRef: Math.round(gstTotalNonRef * 100)/100,
        pstTotalRef: Math.round(pstTotalRef * 100)/100,
        pstTotalNonRef: Math.round(pstTotalNonRef * 100)/100,
        message: $('#message').val()
    };
    console.log("Order Data");
    console.log(data);

    const response = await fetch('/api/salesInvoice/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    const responseData = await response.json();
    console.log(responseData);
    if(responseData.message === "success"){
        alert(`Success: Order has been submitted.\nOrder number: ${$('#orderNum').val().replace(/\s+/g, '')}`);
        resetForm();
    }else{
        alert("Error: Order Unable to be Processed");
    }
}

const updateOrderOptions = (custID) => {
    const currentOrder = $('#orderSelect').val();
    $('#orderSelect').find('option').eq(0).text('');    
    $('#orderSelect').find('option').not(':first').remove();
    getSaleOrdersByCustomer(custID).then(loadSaleOrders).then(()=>{
        if($('#orderSelect').find('option').length <= 1){
            $('#orderSelect').find('option').eq(0).text('No Orders Available');
        }else if($('#orderSelect option[value='+currentOrder+']').length != 0){
            $('#orderSelect').val(currentOrder);
        }else{
            $('#orderSelect').val('');
        }
    });
}

const selectItem = async (row, id) => {
    // console.log(id);

    const item = await getItem(id);
    console.log("Item");
    console.log(item);

    let acctNum = item.lAcNAsset.toString();
    acctNum = acctNum.substring(0, acctNum.length - 4);
    acctNum = parseInt(acctNum);

    row.find('.itemSelect, .descSelect').val(item.lId);
    row.find('.unitNum').val(item.sBuyUnit);
    row.find('.priceNum').val(item.dLastPPrce);

    let amount = row.find('.orderNum').val() * row.find('.priceNum').val();
    amount = Math.round(amount * 100)/100;
    row.find('.amountNum').val(amount);

    updateTax(row.find('.taxNum'));
}

$(document).on("submit", '#orderForm', function(event){
    event.preventDefault();    
    submitOrder();
});

$(document).on("focusout", '.priceNum', function(){
    let row = $(this).parent().parent();
    let amount = $(this).val() * row.find('.quantityNum').val();
    amount = Math.round(amount * 100)/100;
    row.find('.amountNum').val(amount);
    updateTax(row.find('.taxNum'));
});

$(document).on("focusout", '.quantityNum', function(){
    let row = $(this).parent().parent();
    let amount = $(this).val() * row.find('.priceNum').val();
    amount = Math.round(amount * 100)/100;
    row.find('.amountNum').val(amount);

    let bVal = row.find('.orderNum').val() - $(this).val();
    if(bVal < 1){
        bVal = "";
    }else if(bVal > row.find('.orderNum').val()){
        bVal = row.find('.orderNum').val();
    }

    row.find('.bOrderNum').val(bVal);
    updateTax(row.find('.taxNum'));
});

$('#subjects').change(function(){
    updateOrderOptions($(this).val());
});

$('#orderSelect').change(function(){
    if (confirm("You have changed the order number. This will replace everything in the form with data from the selected order number. Do you want to continue?")){
        $('#locations').prop('disabled', true);
        $('#locations').addClass('readOnly');
        getSaleOrder($(this).val()).then(loadSaleOrder);
    }else{
        $(this).val($.data(this, 'current'));
        return false;
    }
    $.data(this, 'current', $(this).val());
});

const initSaleOrders = () => getSaleOrders().then(loadSaleOrders);

initSaleOrders();