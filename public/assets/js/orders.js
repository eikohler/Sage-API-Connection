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

const getUUID = async () => {
    let response =  await fetch("/api/orders/uuid", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }      
    });
    return await response.json();
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

const getEmployees = async () => {
    let response =  await fetch("/api/employees/", {
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

const loadLocations = (locations) => {
    // console.log(locations);
    locations.data.forEach(location => {
        $('#locations').append(`<option value="${location.lId}">${location.sGrpCode}</option>`);
    });
}

const loadItems = (items, row) => {
    // console.log(items);
    items.data.forEach(item => {
        row.find('.itemSelect').append(`<option value="${item.lId}">${item.sPartCode}</option>`);
        row.find('.descSelect').append(`<option value="${item.lId}">${item.sName}</option>`);
    });
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

const resetForm = () =>{
    setOrderFields();
    $('.itemsRow').each(function(){
        $(this).remove();
    });
    $('.shipTo').find('input').each(function(){
        $(this).val(' ');
    });
    addRow();
    $('.accountNum').each(function(){
        $(this).val(''); 
    });
    $('#subjects, #locations, #salesPerson').prop('selectedIndex',0);
    $('.subjectInfo').html('');
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

$(document).on("submit", '#orderForm', function(event){
    event.preventDefault();    
    if(isFormValid()){submitOrder();}
    else{alert("All items must have an item number selected, \nan order amount and back order amount");}
});

const initItems = (row) => {
    getItems().then((data) => loadItems(data, row));
}
const initTax = (row) => {
    getTax().then((data) => loadTax(data, row));
}
const initLocations = () => getLocations().then(loadLocations);

initItems($('.itemsRow').first());
initTax($('.itemsRow').first());
initLocations();