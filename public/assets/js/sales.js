const getCustomers = async () => {
    let response = await fetch("/api/customers", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return await response.json();
}

const getCustomer = async (id) => {
    let response = await fetch(`/api/customers/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    let responseData = await response.json();
    return responseData.data[0];
}

const loadCustomers = (customers) => {
    // console.log(customers);
    customers.data.forEach(customers => {
        $('#subjects').append(`<option value="${customers.lId}">${customers.sName}</option>`);
    });
}

const loadEmployees = (employees) => {
    // console.log(employees);
    employees.data.forEach(employee => {
        $('#salesPerson').append(`<option value="${employee.lId}">${employee.sName}</option>`);
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
    if($('#subjects').val()){
        const customer = await getCustomer($('#subjects').val());
        taxNum.val(customer.lTaxCode);
    }
}

const loadAccount = async (row) => {
    if($('#subjects').val()){
        const customer = await getCustomer($('#subjects').val());

        if(customer.accountName){
            let acctNum = customer.lAcDefRev.toString();
            acctNum = acctNum.substring(0, acctNum.length - 4);
            acctNum = parseInt(acctNum);
    
            let accountNum = row.find('.accountNum');
    
            accountNum.val(`${acctNum} ${customer.accountName}`);
            accountNum.prop('title', `${acctNum} ${customer.accountName}`);
        }
    }
}

const selectCustomer = async (id) => {
    const selectedCustomer = await getCustomer(id);    
    console.log("Customer");
    console.log(selectedCustomer);

    let info = "";
    let adInfo = "";
    if(selectedCustomer.sCntcName){
        info = info + `<p><strong>Contact Name</strong>: ${selectedCustomer.sCntcName}</p>`;
    }
    info = info + `<p><strong>Address</strong>:</p>`;
    if(selectedCustomer.sStreet1){
        adInfo = adInfo + `<p>${selectedCustomer.sStreet1}</p>`;
    }
    if(selectedCustomer.sStreet2){
        adInfo = adInfo + `<p>${selectedCustomer.sStreet2}</p>`;
    }
    if(selectedCustomer.sCity){
        adInfo = adInfo + `<span>${selectedCustomer.sCity}</span>`;
    }
    if(selectedCustomer.sProvState){
        if(selectedCustomer.sCity){
            adInfo = adInfo + `<span>, ${selectedCustomer.sProvState} </span>`;
        }else{
            adInfo = adInfo + `<span>${selectedCustomer.sProvState} </span>`;
        }
    }
    if(selectedCustomer.sPostalZip){
        adInfo = adInfo + `<span>${selectedCustomer.sPostalZip}</span>`;
    }
    if(selectedCustomer.sCountry){
        adInfo = adInfo + `<p>${selectedCustomer.sCountry}</p>`;
    }
    if(adInfo.length<=0){
        $('.subjectInfo').html(info+'<p>No Info Available for this Customer</p>');
    }else{
        $('.subjectInfo').html(info + adInfo);
    }

    let shipping = [];
    let shipAddr = "";
    if(selectedCustomer.sName){
        shipping.push(selectedCustomer.sName);
    }
    if(selectedCustomer.sShipCntc){
        shipping.push(selectedCustomer.sShipCntc);
    }
    if(selectedCustomer.sShipStrt1){
        shipping.push(selectedCustomer.sShipStrt1);
    }
    if(selectedCustomer.sShipCity){
        shipAddr = shipAddr + selectedCustomer.sShipCity + " ";
    }
    if(selectedCustomer.sShipPrvSt){
        shipAddr = shipAddr + selectedCustomer.sShipPrvSt + " ";
    }
    if(selectedCustomer.sShipPstZp){
        shipAddr = shipAddr + selectedCustomer.sShipPstZp + " ";
    }

    shipping.push(shipAddr);

    if(selectedCustomer.sShipCnty){
        shipping.push(selectedCustomer.sShipCnty);
    }

    $('.shipTo').find('input').each(function(){
        $(this).val(shipping.shift());
    });


    $('#salesPerson').val(selectedCustomer.lSalManID);

    $('#locations').val(selectedCustomer.lInvLocId);
    $('.itemSelect').each(function(){
        if($(this).val()){
            selectItem($(this).parent().parent(), $(this).val());
        }
    });

    $('.taxNum').each(function(){
        $(this).val(selectedCustomer.lTaxCode);
        updateTax($(this));
    });

    if(selectedCustomer.accountName){
        let acctNum = selectedCustomer.lAcDefRev.toString();
        acctNum = acctNum.substring(0, acctNum.length - 4);
        acctNum = parseInt(acctNum);
    
        $('.accountNum').each(function(){
            $(this).val(`${acctNum} ${selectedCustomer.accountName}`);
            $(this).prop('title', `${acctNum} ${selectedCustomer.accountName}`);
        });
    }else{
        $('.accountNum').each(function(){
            $(this).val('');
            $(this).prop('title', 'No Account');
        });
    }

    $('.freight-tax').val(selectedCustomer.lTaxCode);
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
    loadAccount($('.itemsRow').last());
};

$('#subjects').change(function(){
    selectCustomer($(this).val());
});

const initCustomers = () => getCustomers().then(loadCustomers);

const initEmployees = () => getEmployees().then(loadEmployees);

initCustomers();

initEmployees();