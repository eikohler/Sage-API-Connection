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
        $('#subjects').append(`<option value="${vendor.lId}">${vendor.sName}</option>`);
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
        $('.subjectInfo').html(info+'<p>No Info Available for this Vendor</p>');
    }else{
        $('.subjectInfo').html(info + adInfo);
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

$('#subjects').change(function(){
    selectVendor($(this).val());
});

const initVendors = () => getVendors().then(loadVendors);

initVendors();