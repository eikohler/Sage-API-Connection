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



## tPOLineT Purchase Order Tax Info ##