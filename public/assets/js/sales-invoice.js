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

const loadSaleOrders = (orders) => {
    console.log(orders);
    orders.data.forEach(order => {
        $('#orderSelect').append(`<option value="${order.lId}">${order.sSONum}</option>`);
    });
}

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

    const data = { 
        newID: newID,
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

$('#subjects').change(function(){
    $('#orderSelect').find('option').eq(0).text('');
    $('#orderSelect').find('option').not(':first').remove();
    getSaleOrdersByCustomer($(this).val()).then(loadSaleOrders).then(()=>{
        if($('#orderSelect').find('option').length <= 1){
            $('#orderSelect').find('option').eq(0).text('No Orders Available');
        }
    });
});

const initSaleOrders = () => getSaleOrders().then(loadSaleOrders);

initSaleOrders();