# Sage API Connection

## tPurOrdr Purchase Order General Info ##
- lId - Purchase order ID 
    - Auto generate - sync with tPOLine lPOId
- lVenId - Vendor ID
    - Pull from user selection of vendor in GUI - required
- Purchase order/quote number
    - User input - required
- dtASDate - Get current datetime for DB recording
### Shipping info ###
(sFrom fields pull from tVendor based on user vendor selection)
- sFrom1 - Vendor address line 1 (tVendor.sStreet1)
- sFrom2 - Vendor address line 2 (tVendor.sStreet2)
- sFrom3 - Vendor address line 3 (tVendor.sCity, sProvState sPostalZip)
- sFrom4 - Vendor address line 4 (tVendor.sCountry)

(sShipTo fields always the same for EvoTech Specifics)
- sShipTo2 - Ship to address line 2
- sShipTo3 - Ship to address line 3
- sShipTo4 - Ship to address line 4
- sShipTo5 - Ship to address line 5

- dtReqDate - Requested ship date
    - User input (calendar picker)
- dtPODate - Purchase order date
    - Get current datetime
- fDiscPer - Discount percentage (Early Payment terms %)
- nDiscDay - Discount if paid in number of days
- nNetDay - Discount if net amount paid in number of days
- dTotal - Total amount 

- lCurrncyId - Currency ID used (default 1)

- lInvLocId - Inventory Location ID
    - Vancouver = 1 (Default)
    - Newmarket = 3
    - Markham = 4
    - Ferndale = 5

## tPOLineT Purchase Order Tax Info ##
- lPORecId - Purchase Order ID (same as lId)
- nLineNum - Detail Line Number (line for each tax amount on same order)
- lTaxAuth - Tax ID (GST, PST)
- bExempt - Tax is exempt (true of false)
- bTaxAmtDef -  Use calculated tax amount (true of false)
- dTaxAmt - Tax amount (calculated tax amount)


## tPOToT Purcahse order total taxes info ##
- lPOId Number - Purchase order ID (same as lId)
- lTaxAuth Number - Tax ID (GST (1), PST (2)) 
- dTaxAmt Number - Total tax amount (Freight tax amount)
- dNonRef Number - Total non-refundable amount 
    - (total tax amount of all items for specific Tax ID (items + freight tax))

## tPOLine
- lPOId -  Purchase order ID (same as lId)
- nLineNum - Purchase order detail line number
- lInventId -  Inventory and service ID
- sPartCode - Inventory item number
- dOrdered -  Quantity ordered (stocking units)
- dRemaining -  Quantity on back order (stocking units)
- sUnits - Units
- nUnitType - Type of units used*
- sDesc -  Inventory item description
- dPrice -  Inventory item price
- dTaxAmt -  Tax amount
- lTaxCode -  Tax code ID
- lTaxRev -  Tax revision used
- bFreight -  Freight line
- Damount - Amount
- lAcctId - Account ID
- BinvItem -  Inventory item
- DdutyPer - Duty percentage
- dDutyAmt - Duty amount
- lAcctDptId - Department ID for Account
- lInvLocId - Inventory Location ID
- bDefPrc -  Price is default price from price list
- bDefDesc -  Is Default Inventory Description Used
- bUseVenItm -  Use Vendor Inventory

## tVendor ##
- lTaxCode - Default tax code ID used for this vendor
    - These will preload upon selecting the vendor in interface
    - 1 (No Tax)
    - 21 (E - GST Exempt)
    - 23 (G - GST 5%)


## tInvLoc (Contains inventory location information) ##
- lId Number - Inventory Location ID
- sGrpCode - Code (Vancouver, Markham, etc.)


## tInvByLn (Contains info on item last purchase pricing by location and in stock quantity levels) ##


tTaxCode

lAcNAsset = lAcctId

tAccount has account descriptions by ID