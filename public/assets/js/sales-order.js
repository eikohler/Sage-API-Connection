const getLastSOrderID = async () => {
    let response =  await fetch("/api/salesOrder/lastID", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }      
    });
    let idDate = await response.json();
    return idDate.data[0].lId;
}

const addRow = async () => {
    $('#itemsBody').append(`<tr class="itemsRow">
        <td class="item"><select name="item" class="itemSelect" autocomplete="on">
        <option value="" selected=""></option>
        </select></td>
        <td class="quantity"><input name="quantityNum" class="quantityNum readOnly" readonly title="Stock Quantity"></td>
        <td class="order"><input name="orderNum" type="number" min="0" class="orderNum"></td>
        <td class="bOrder"><input name="bOrderNum" type="number" min="0" class="bOrderNum"></td>
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
    row.find('.quantityNum').val(item.dInStock);
    row.find('.quantityNum').prop('title', `${item.dInStock}`);
    row.find('.priceNum').val(item.dLastPPrce);

    let amount = row.find('.orderNum').val() * row.find('.priceNum').val();
    amount = Math.round(amount * 100)/100;
    row.find('.amountNum').val(amount);

    updateTax(row.find('.taxNum'));
}

const updateTax = async (elem) =>{
    let taxCode = elem.val();
    let gst;
    let pst;
    let amount;

    if(elem.hasClass('taxNum')){
        let row = elem.parent().parent();
        gst = row.find('.gstNum');
        pst = row.find('.pstNum');
        amount = row.find('.amountNum').val();
    }else if(elem.hasClass('freight-tax')){
        gst = $('#freightGST');
        pst = $('#freightPST');
        amount = $('#freight').val();
    }

    const selectedTax = await getTaxInfo(taxCode);

    if(selectedTax.length === 1){
        pst.prop('readonly', true);
        pst.addClass('readOnly');
        pst.val('');
    }

    selectedTax.forEach(taxType=>{
        if(taxType.lTaxAuth === 1){
            if(taxType.dPct > 0){
                gst.prop('readonly', false);
                gst.removeClass('readOnly');
                gst.val(Math.round((amount*(taxType.dPct/100)) * 100)/100);
            }else{
                gst.prop('readonly', true);
                gst.addClass('readOnly');
                gst.val('');
            }
        }else if(taxType.lTaxAuth === 2){
            if(taxType.dPct > 0){
                pst.prop('readonly', false);
                pst.removeClass('readOnly');
                pst.val(Math.round((amount*(taxType.dPct/100)) * 100)/100);
            }else{
                pst.prop('readonly', true);
                pst.addClass('readOnly');
                pst.val('');
            }
        }else{
            gst.prop('readonly', true);
            gst.addClass('readOnly');
            gst.val('');
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
        }
    });
    updateTotals();
}

$(document).on("submit", '#orderForm', function(event){
    event.preventDefault();    
    if(isFormValid()){submitOrder();}
    else{alert("All items must have an item number selected, \nan order amount and back order amount");}
});

$(document).on("focusout", '.priceNum', function(){
    let row = $(this).parent().parent();
    let amount = $(this).val() * row.find('.orderNum').val();
    amount = Math.round(amount * 100)/100;
    row.find('.amountNum').val(amount);
    updateTax(row.find('.taxNum'));
});

$(document).on("focusout", '.orderNum', function(){
    let row = $(this).parent().parent();
    let amount = $(this).val() * row.find('.priceNum').val();
    amount = Math.round(amount * 100)/100;
    row.find('.amountNum').val(amount);
    row.find('.bOrderNum').val($(this).val());
    updateTax(row.find('.taxNum'));
});

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

            // Create user input object
            const userInput = {
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

    let lastID = await getLastSOrderID();
    let newID = lastID + 1;

    let lastJEntID = await getLastJEntID();
    let newJEntID = lastJEntID + 1;

    const data = { 
        newID: newID,
        newJEntID: newJEntID,
        customer: customer, 
        shipTo: shipTo, 
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

    const response = await fetch('/api/salesOrder/', {
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