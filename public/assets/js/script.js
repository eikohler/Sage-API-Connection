$( document ).ready(function() {
    setOrderFields();
});

const setOrderFields = () =>{
    $('#orderDate').datetimepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'HH:mm:ss',
     });
    $('#orderDate').datetimepicker('setDate', 'today');
    $('#shipDate').datetimepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'HH:mm:ss',
    });
    $('#shipDate').val('');
    getUUID().then((data)=>{
        $('#orderNum').val(data.uuid.substring(0, 20));
    });
}

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

const getTaxInfo = async (id) => {
    let response = await fetch(`/api/tax/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    let responseData = await response.json();
    return responseData.data;
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
        updateTax($(this));
    });
    $('.freight-tax').val(selectedVendor.lTaxCode);
    updateTax($('.freight-tax'));
}

const selectItem = async (row, id) => {
    // console.log(id);

    const item = await getItem(id);
    console.log("Item");
    console.log(item);

    let acctNum = item.lAcNAsset.toString();
    acctNum = acctNum.substring(0, acctNum.length - 4);
    acctNum = parseInt(acctNum);

    if(item.dInStock === 0){
        row.addClass('out-of-stock');
    }else{
        row.removeClass('out-of-stock');
    }

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
        if(!$(this).parent().parent().hasClass('out-of-stock')){
            if($(this).val()) subtotalAmt = subtotalAmt + parseFloat($(this).val());
        }
    });
    subtotalAmt = Math.round(subtotalAmt * 100)/100;
    $('#subtotal').val(subtotalAmt);

    $('.gstNum').each(function(){
        if(!$(this).parent().parent().hasClass('out-of-stock')){
            if($(this).val()) gstAmt = gstAmt + parseFloat($(this).val());
        }
    });
    if($('#freightGST').val()) gstAmt = gstAmt + parseFloat($('#freightGST').val());
    gstAmt = Math.round(gstAmt * 100)/100;
    $('#gst').val(gstAmt);

    $('.pstNum').each(function(){
        if(!$(this).parent().parent().hasClass('out-of-stock')){
            if($(this).val()) pstAmt = pstAmt + parseFloat($(this).val());
        }
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

            // Create user input object
            const userInput = {
                orderQuantity: $(this).find('.orderNum').val(),
                backOrderQuantity: $(this).find('.bOrderNum').val(),
                taxCode: $(this).find('.taxNum').val(),
                taxAmt: taxAmt,
                gst: gstNum,
                pst: pstNum,
                amount: $(this).find('.amountNum').val()
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

    let lastID = await getLastPOrderID();
    let newID = lastID + 1;

    const data = { 
        newID: newID,
        vendor: vendor, 
        shipTo: shipTo, 
        orderNum: $('#orderNum').val().replace(/\s+/g, ''), 
        orderDate: $('#orderDate').val(), 
        shipDate: $('#shipDate').val(), 
        locationID: $('#locations').val(), 
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
        pstTotalNonRef: Math.round(pstTotalNonRef * 100)/100
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
    const responseData = await response.json();
    console.log(responseData);
    if(responseData.message === "success"){
        alert(`Success: Order has been submitted.\nOrder number: ${$('#orderNum').val().replace(/\s+/g, '')}`);
        resetForm();
    }else{
        alert("Error: Order Unable to be Processed");
    }
}

const resetForm = () =>{
    setOrderFields();
    $('.itemsRow').each(function(){
        $(this).remove();
    });
    addRow();
    $('#vendors, #locations').prop('selectedIndex',0);
    $('.vendorInfo').html('');
    $('.totals-container').find('input').val('');
    $('.totals-container').find('select').prop('selectedIndex',0);
}

const isFormValid = () => {
    let result = true;
    if($('.itemsRow').length > 1){
        $('.itemsRow').each(function(){
            if($(this).find('.itemSelect').val()){                
                if(!($(this).find('.orderNum').val() && $(this).find('.bOrderNum').val())){
                    result = false;
                    return false;
                }
            }
        });
    }else{
        return false;
    }
    return result;
}

$(document).on("change", '.freight-tax, #freight', function(){
    updateTax($('.freight-tax'));
});

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
    updateTax(row.find('.taxNum'));
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
    updateTax($(this));
});

$(document).on("submit", '#purOrdrForm', function(event){
    event.preventDefault();    
    if(isFormValid()){submitOrder();}
    else{alert("All items must have an item number selected, \nan order amount and back order amount");}
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