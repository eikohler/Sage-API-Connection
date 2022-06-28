$( document ).ready(function() {
    $('#orderDate').datepicker();
    $('#orderDate').datepicker('setDate', 'today q');
    $('#shipDate').datepicker();
    getUUID().then((data)=>{
        $('#orderNum').val(data.uuid);
    })
    
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
    console.log(item);

    let acctNum = item.lAcNAsset.toString();
    acctNum = acctNum.substring(0, acctNum.length - 4);
    acctNum = parseInt(acctNum);

    row.find('.itemSelect, .descSelect').val(item.lId);
    row.find('.unitNum').val(item.sBuyUnit);
    row.find('.quantityNum').val(item.dInStock);
    row.find('.quantityNum').prop('title', `${item.dInStock}`);
    row.find('.priceNum').val(item.dLastPPrce);
    row.find('.accountNum').val(`${acctNum} ${item.sName}`);
    row.find('.accountNum').prop('title', `${acctNum} ${item.sName}`);

    let amount = row.find('.orderNum').val() * row.find('.priceNum').val();
    amount = Math.round(amount * 100)/100;
    row.find('.amountNum').val(amount);

    updateTax(row);
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

const addRow = () => {
    $('#itemsBody').append(`<tr class="itemsRow">
        <td class="item"><select name="item" class="itemSelect" autocomplete="on">
            <option value="" disabled="" selected=""></option>
        </select></td>
        <td class="quantity"><input name="quantityNum" class="quantityNum readOnly" readonly title="Stock Quantity"></td>
        <td class="order"><input name="orderNum" class="orderNum"></td>
        <td class="bOrder"><input name="bOrderNum" class="bOrderNum"></td>
        <td class="unit"><input name="unitNum" class="unitNum"></td>
        <td class="description"><select name="desc" class="descSelect" autocomplete="on">
            <option value="" disabled="" selected=""></option>
        </select></td>
        <td class="price"><input name="priceNum" class="priceNum"></td>
        <td class="tax"><select name="taxNum" class="taxNum" autocomplete="on"></select></td>
        <td class="gst"><input name="gstNum" class="gstNum readOnly" readonly></td>
        <td class="pst"><input name="pstNum" class="pstNum readOnly" readonly></td>
        <td class="amount"><input name="amountNum" class="amountNum"></td>
        <td class="account"><input name="accountNum" class="accountNum readOnly" readonly title="Account"></td>
    </tr>`);
    initItems($('.itemsRow').last());
    initTax($('.itemsRow').last());
};

$('#vendors').change(function(){
    selectVendor($(this).val());
});

$(document).on("change", '.itemSelect, .descSelect', function(){
    let row = $(this).parent().parent();
    if(!row.find('.unitNum').val()){
        addRow();
    }
    selectItem($(this).parent().parent(), $(this).val());
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
});

$(document).on("focusout", '.bOrderNum', function(){
    let row = $(this).parent().parent();
    let orderNum = row.find('.orderNum').val();
    if((orderNum - $(this).val()) < 0){
        alert("Quantity backordered cannot exceed quantity ordered");
        $(this).val(orderNum);
    }
    updateTax(row);
});

$('.taxNum').change(function(){
    updateTax($(this).parent().parent());
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