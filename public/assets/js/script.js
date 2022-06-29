$( document ).ready(function() {
    $('#orderDate').datetimepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'HH:mm:ss',
     });
    $('#orderDate').datetimepicker('setDate', 'today');
    $('#shipDate').datetimepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'HH:mm:ss',
     });
    getUUID().then((data)=>{
        $('#orderNum').val(data.uuid.substring(0, 20));
    });
});

const getItems = async () => {
    let response =  await fetch("/api/inventory/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }      
    });
    return await response.json();
}

const getItem = async (id) => {
    const response = await fetch('/api/inventory/item-by-location', {
        method: 'post',
        body: JSON.stringify({ id: id, locID: $('#locations').val() }),
        headers: { 'Content-Type': 'application/json' }
    });
    let responseData = await response.json();

    if(responseData.data.length > 0){
        return responseData.data[0];
    }else{
        const response = await fetch(`/api/inventory/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        let responseData = await response.json();     
        responseData.data[0].dInStock = 0;
        return responseData.data[0];
    }
}

const getLocations = async () => {
    let response =  await fetch("/api/locations/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }      
    });
    return await response.json();
}

const getTax = async () => {
    let response =  await fetch("/api/tax/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }      
    });
    return await response.json();
}

const getUUID = async () => {
    let response =  await fetch("/api/purOrder/uuid", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }      
    });
    return await response.json();
}

const getLastPOrderID = async () => {
    let response =  await fetch("/api/purOrder/lastID", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }      
    });
    let idDate = await response.json();
    return idDate.data[0].lId;
}

const getVendors = async () => {
    let response = await fetch("/api/vendors", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return await response.json();
}

const getVendor = async (id) => {
    let response = await fetch(`/api/vendors/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    let responseData = await response.json();
    return responseData.data[0];
}

const loadVendors = (vendors) => {
    // console.log(vendors);
    vendors.data.forEach(vendor => {
        $('#vendors').append(`<option value="${vendor.lId}">${vendor.sName}</option>`);
    });
}

const loadLocations = (locations) => {
    // console.log(locations);
    locations.data.forEach(location => {
        $('#locations').append(`<option value="${location.lId}">${location.sGrpCode}</option>`);
    });
}

const loadTax = async (taxCodes, row) => {
    // console.log(taxCodes);
    let taxNum = row.find('.taxNum');
    taxCodes.data.forEach(taxCode => {
        taxNum.append(`<option value="${taxCode.lId}">${taxCode.sCode} - ${taxCode.sDesc}</option>`);        
    });
    if ($('.freight-tax').has('option').length == 0){
        taxCodes.data.forEach(taxCode => {
            $('.freight-tax').append(`<option value="${taxCode.lId}">${taxCode.sCode} - ${taxCode.sDesc}</option>`);    
        });
    }
    if($('#vendors').val()){
        const vendor = await getVendor($('#vendors').val());
        taxNum.val(vendor.lTaxCode);
    }
}

const loadItems = (items, row) => {
    // console.log(items);
    items.data.forEach(item => {
        row.find('.itemSelect').append(`<option value="${item.lId}">${item.sPartCode}</option>`);
        row.find('.descSelect').append(`<option value="${item.lId}">${item.sName}</option>`);
    });
}

const selectVendor = async (id) => {
    const selectedVendor = await getVendor(id);    
    console.log("Vendor");
    console.log(selectedVendor);

    let info = "";
    let adInfo = "";
    if(selectedVendor.sCntcName){
        info = info + `<p><strong>Contact Name</strong>: ${selectedVendor.sCntcName}</p>`;
    }
    info = info + `<p><strong>Address</strong>:</p>`;
    if(selectedVendor.sStreet1){
        adInfo = adInfo + `<p>${selectedVendor.sStreet1}</p>`;
    }
    if(selectedVendor.sStreet2){
        adInfo = adInfo + `<p>${selectedVendor.sStreet2}</p>`;
    }
    if(selectedVendor.sCity){
        adInfo = adInfo + `<span>${selectedVendor.sCity}</span>`;
    }
    if(selectedVendor.sProvState){
        if(selectedVendor.sCity){
            adInfo = adInfo + `<span>, ${selectedVendor.sProvState} </span>`;
        }else{
            adInfo = adInfo + `<span>${selectedVendor.sProvState} </span>`;
        }
    }
    if(selectedVendor.sPostalZip){
        adInfo = adInfo + `<span>${selectedVendor.sPostalZip}</span>`;
    }
    if(selectedVendor.sCountry){
        adInfo = adInfo + `<p>${selectedVendor.sCountry}</p>`;
    }
    if(adInfo.length<=0){
        $('.vendorInfo').html(info+'<p>No Info Available for this Vendor</p>');
    }else{
        $('.vendorInfo').html(info + adInfo);
    }

    $('.taxNum').each(function(){
        $(this).val(selectedVendor.lTaxCode);
        updateTax($(this).parent().parent());
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
    row.find('.quantityNum').val(item.dInStock);
    row.find('.quantityNum').prop('title', `${item.dInStock}`);
    row.find('.priceNum').val(item.dLastPPrce);
    row.find('.accountNum').val(`${acctNum} ${item.accountName}`);
    row.find('.accountNum').prop('title', `${acctNum} ${item.accountName}`);

    let amount = row.find('.orderNum').val() * row.find('.priceNum').val();
    amount = Math.round(amount * 100)/100;
    row.find('.amountNum').val(amount);

    updateTax(row);
    updateTotals();
}

const updateTax = (row) =>{
    let taxCode = row.find('.taxNum').val();
    let gst = row.find('.gstNum');
    let pst = row.find('.pstNum');
    let amount = row.find('.amountNum').val();
    switch(taxCode) {
        case '1':
            gst.prop('readonly', true);
            gst.addClass('readOnly');
            gst.val('');
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;
        case '21':
            gst.prop('readonly', true);
            gst.addClass('readOnly');
            gst.val('');
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;
        case '23':
            gst.prop('readonly', false);
            gst.removeClass('readOnly');
            gst.val(Math.round((amount*0.05) * 100)/100);
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;
        case '25':
            gst.prop('readonly', false);
            gst.removeClass('readOnly');
            gst.val(Math.round((amount*0.13) * 100)/100);
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;
        case '26':
            gst.prop('readonly', false);
            gst.removeClass('readOnly');
            gst.val(Math.round((amount*0.12) * 100)/100);
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;
        case '28':
            gst.prop('readonly', false);
            gst.removeClass('readOnly');
            gst.val(Math.round((amount*0.15) * 100)/100);
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;
        case '29':
            gst.prop('readonly', false);
            gst.removeClass('readOnly');
            gst.val(Math.round((amount*0.05) * 100)/100);
            pst.prop('readonly', false);
            pst.removeClass('readOnly');
            pst.val(Math.round((amount*0.07) * 100)/100);
            break;
        case '30':
            gst.prop('readonly', false);
            gst.removeClass('readOnly');
            gst.val(Math.round((amount*0.14) * 100)/100);
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;            
    }
}

const updateFreightTax = () =>{
    let taxCode = $('.freight-tax').val();
    let gst = $('#freightGST');
    let pst = $('#freightPST');
    let amount = $('#freight').val();
    switch(taxCode) {
        case '1':
            gst.prop('readonly', true);
            gst.addClass('readOnly');
            gst.val('');
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;
        case '21':
            gst.prop('readonly', true);
            gst.addClass('readOnly');
            gst.val('');
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;
        case '23':
            gst.prop('readonly', false);
            gst.removeClass('readOnly');
            gst.val(Math.round((amount*0.05) * 100)/100);
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;
        case '25':
            gst.prop('readonly', false);
            gst.removeClass('readOnly');
            gst.val(Math.round((amount*0.13) * 100)/100);
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;
        case '26':
            gst.prop('readonly', false);
            gst.removeClass('readOnly');
            gst.val(Math.round((amount*0.12) * 100)/100);
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;
        case '28':
            gst.prop('readonly', false);
            gst.removeClass('readOnly');
            gst.val(Math.round((amount*0.15) * 100)/100);
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;
        case '29':
            gst.prop('readonly', false);
            gst.removeClass('readOnly');
            gst.val(Math.round((amount*0.05) * 100)/100);
            pst.prop('readonly', false);
            pst.removeClass('readOnly');
            pst.val(Math.round((amount*0.07) * 100)/100);
            break;
        case '30':
            gst.prop('readonly', false);
            gst.removeClass('readOnly');
            gst.val(Math.round((amount*0.14) * 100)/100);
            pst.prop('readonly', true);
            pst.addClass('readOnly');
            pst.val('');
            break;            
    }
    updateTotals();
}

const addRow = () => {
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
    initItems($('.itemsRow').last());
    initTax($('.itemsRow').last());
};

const updateTotals = () => {
    let subtotalAmt = 0;
    let freightAmt = 0;
    if($('#freight').val()) freightAmt = parseFloat($('#freight').val());
    let gstAmt = 0;
    let pstAmt = 0;
    let totalAmt = 0;
    $('.amountNum').each(function(){
        if($(this).val()) subtotalAmt = subtotalAmt + parseFloat($(this).val());
    });
    subtotalAmt = Math.round(subtotalAmt * 100)/100;
    $('#subtotal').val(subtotalAmt);

    $('.gstNum').each(function(){
        if($(this).val()) gstAmt = gstAmt + parseFloat($(this).val());
    });
    if($('#freightGST').val()) gstAmt = gstAmt + parseFloat($('#freightGST').val());
    gstAmt = Math.round(gstAmt * 100)/100;
    $('#gst').val(gstAmt);

    $('.pstNum').each(function(){
        if($(this).val()) pstAmt = pstAmt + parseFloat($(this).val());
    });
    if($('#freightPST').val()) pstAmt = pstAmt + parseFloat($('#freightPST').val());
    pstAmt = Math.round(pstAmt * 100)/100;
    $('#pst').val(pstAmt);

    totalAmt = subtotalAmt + freightAmt + gstAmt + pstAmt;
    totalAmt = Math.round(totalAmt * 100)/100;
    $('#total').val(totalAmt);
}

const submitOrder = async () => {
    // Get vendor
    const vendor = await getVendor($('#vendors').val());

    // Get shipping address fields
    let shipTo = [];
    $('.shipTo').find('input').each(function(){
        shipTo.push($(this).val());
    });    

    // Get items per row
    let items = [];
    let lineNum = 1;
    $('.itemsRow').each(async function(){
        if($(this).find('.itemSelect').val()){
            // Get item by id
            const item = await getItem($(this).find('.itemSelect').val());

            // Get total tax amount
            let taxAmt = 0;
            if($(this).find('.gstNum').val()) taxAmt = taxAmt + parseFloat($(this).find('.gstNum').val());
            if($(this).find('.pstNum').val()) taxAmt = taxAmt + parseFloat($(this).find('.pstNum').val());
            taxAmt = Math.round(taxAmt * 100)/100;

            // Create user input object
            const userInput = {
                orderQuantity: $(this).find('.orderNum').val(),
                backOrderQuantity: $(this).find('.bOrderNum').val(),
                taxCode: $(this).find('.taxNum').val(),
                taxAmt: taxAmt,
                amount: $(this).find('.amountNum').val()
            };

            // Add user input to item object, push item object to items array
            item.userInput = userInput;
            item.lineNum = lineNum;
            items.push(item);
            lineNum = lineNum + 1;
        }
    });

    // Get freight tax amount total
    let freightTaxAmt = 0;
    if($('#freightGST').val()) freightTaxAmt = freightTaxAmt + parseFloat($('#freightGST').val());
    if($('#freightPST').val()) freightTaxAmt = freightTaxAmt + parseFloat($('#freightPST').val());
    freightTaxAmt = Math.round(freightTaxAmt * 100)/100;

    let lastID = await getLastPOrderID();
    let newID = lastID + 1;

    const data = { 
        newID: newID,
        vendor: vendor, 
        shipTo: shipTo, 
        orderNum: $('#orderNum').val(), 
        orderDate: $('#orderDate').val(), 
        shipDate: $('#shipDate').val(), 
        locationID: $('#locations').val(), 
        items: items,
        freightAmt: $('#freight').val(),
        freightTaxCode: $('.freight-tax').val(),
        freightTaxAmt: freightTaxAmt,
        totalAmt: $('#total').val()
    };
    console.log("Order Data");
    console.log(data);

    const response = await fetch('/api/purOrder/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    if(response.ok){
        console.log("Successful POST");
    }else{
        console.log(response.statusText);
    }
}

$(document).on("change", '.freight-tax, #freight', updateFreightTax);

$('#vendors').change(function(){
    selectVendor($(this).val());
});

$(document).on("change", '.itemSelect, .descSelect', function(){
    if($(this).val()){
        let row = $(this).parent().parent();
        if(!row.find('.unitNum').val()){
            addRow();
        }
        selectItem($(this).parent().parent(), $(this).val());
    }else{
        if($(this).hasClass('itemSelect')){
            $(this).parent().parent().remove();
            updateTotals();
        }
    }
});

$('#locations').change(function(){
    $('.itemSelect').each(function(){
        if($(this).val()){
            selectItem($(this).parent().parent(), $(this).val());
        }
    });
});

$(document).on("focusout", '.orderNum', function(){
    let row = $(this).parent().parent();
    let amount = $(this).val() * row.find('.priceNum').val();
    amount = Math.round(amount * 100)/100;
    row.find('.amountNum').val(amount);
    row.find('.bOrderNum').val($(this).val());
    updateTax(row);
    updateTotals();
});

$(document).on("focusout", '.bOrderNum', function(){
    let row = $(this).parent().parent();
    let orderNum = row.find('.orderNum').val();
    if((orderNum - $(this).val()) < 0){
        alert("Quantity backordered cannot exceed quantity ordered");
        $(this).val(orderNum);
    }
});


$(document).on("change", '.taxNum', function(){
    updateTax($(this).parent().parent());
    updateTotals();
});

$(document).on("submit", '#purOrdrForm', function(event){
    event.preventDefault();
    submitOrder();
});

const initVendors = () => getVendors().then(loadVendors);
const initItems = (row) => {
    getItems().then((data) => loadItems(data, row));
}
const initTax = (row) => {
    getTax().then((data) => loadTax(data, row));
}
const initLocations = () => getLocations().then(loadLocations);

initVendors();
initItems($('.itemsRow').first());
initTax($('.itemsRow').first());
initLocations();