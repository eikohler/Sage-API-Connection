const uuid = require('uuid');
const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

router.get('/uuid', (req, res) => {
    let id = uuid.v1();
    res.json({
        uuid: id
    });
});

router.get('/lastID', (req, res) => {
    const sql = `SELECT lId FROM simply.tPurOrdr ORDER BY lId DESC LIMIT 0, 1;`;
    db.query(sql, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: rows,
      });
    });
});

router.post('/', (req, res) => {
    const queries = [];
    let sql = `
    INSERT INTO simply.tPurOrdr (lId, lVenId, sPONum, dtASDate, tmASTime, sASUserId, sASOrgId, sName, sFrom1, sFrom2, sFrom3, sFrom4, sFrom5, sShipTo1, sShipTo2, sShipTo3, sShipTo4, sShipTo5, sShipTo6, dtReqDate, dtPODate, bPrinted, bEmailed, sUser, fDiscPer, nDiscDay, nNetDay, dTotal, lNxtJourId, sShipper, bQuote, bImport, bDutyStore, lCurrncyId, dExchRate, bPrePaid, lPaidJor, nPdType, sCrdName, lAcctNum, lDepId, bCleared, lChqId, lInvLocId, bRmBPLst, nLangPref, nFilled, bReversed, bReversal, bUseVenItm)
    VALUES('${req.body.newID}', '${req.body.vendor.lId}', '${req.body.orderNum}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'sysadmin', 'winsim', '${req.body.vendor.sName}', '${req.body.vendor.sStreet1}', '${req.body.vendor.sStreet2}', '${req.body.vendor.sCity}', '${req.body.vendor.sProvState}', '${req.body.vendor.sPostalZip}', '${req.body.shipTo[0]}', '${req.body.shipTo[1]}', '${req.body.shipTo[2]}', '${req.body.shipTo[3]}', '${req.body.shipTo[4]}', '${req.body.shipTo[5]}', '${req.body.shipDate}', '${req.body.orderDate}', '0', '0', 'sysadmin', '0', '0', '0', '${req.body.totalAmt}', '28805', '', '0', '0', '0', '1', '0', '0', '0', '0', '', '0', '0', '0', '0', '${req.body.locationID}', '0', '0', '0', '0', '0', '0');
    `;
    queries.push(sql);   
    req.body.items.forEach(item => {
        const sql = `
        INSERT INTO simply.tPOLine (lPOId, nLineNum, lInventId, sPartCode, dQuantity, dOrdered, dRemaining, sUnits, nUnitType, sDesc, dPrice, dTaxAmt, lTaxCode, lTaxRev, bFreight, dAmount, lAcctId, bInvItem, dDutyPer, dDutyAmt, lAcctDptId, lInvLocId, bDefPrc, bDefDesc, bUseVenItm)
        VALUES('${req.body.newID}', '${item.lineNum}', '${item.lId}', '${item.sPartCode}', '${item.dInStock}', '${item.userInput.orderQuantity}', '${item.userInput.backOrderQuantity}', '${item.sBuyUnit}', '1', '${item.description}', '${item.dLastPPrce}', '${item.userInput.taxAmt}', '${item.userInput.taxCode}', '16', '0', '${item.userInput.amount}', '${item.lAcNAsset}', '1', '0', '0', '0', '${req.body.locationID}', '1', '1', '0');
        `;
        queries.push(sql);
        if(item.userInput.gst){
            const gst = `
            INSERT INTO simply.tPOLineT (lPORecId, nLineNum, lTaxAuth, bExempt, bTaxAmtDef, dTaxAmt)
            VALUES('${req.body.newID}', '${item.lineNum}', '1', '0', '1', '${item.userInput.gst}');
            `;
            queries.push(gst);
        }
        if(item.userInput.pst){
            const pst = `
            INSERT INTO simply.tPOLineT (lPORecId, nLineNum, lTaxAuth, bExempt, bTaxAmtDef, dTaxAmt)
            VALUES('${req.body.newID}', '${item.lineNum}', '2', '0', '1', '${item.userInput.pst}');
            `;
            queries.push(pst);
        }        
    });
    sql = `
    INSERT INTO simply.tPOLine (lPOId, nLineNum, lInventId, sPartCode, dQuantity, dOrdered, dRemaining, sUnits, nUnitType, sDesc, dPrice, dTaxAmt, lTaxCode, lTaxRev, bFreight, dAmount, lAcctId, bInvItem, dDutyPer, dDutyAmt, lAcctDptId, lInvLocId, bDefPrc, bDefDesc, bUseVenItm)
    VALUES('${req.body.newID}', '${req.body.items.length + 1}', '0', '', '0', '0', '0', '', '1', '', '0', '${req.body.freightTaxAmt}', '${req.body.freightTaxCode}', '16', '1', '${req.body.freightAmt}', '50800000', '0', '0', '0', '0', '${req.body.locationID}', '0', '1', '0');
    `;
    queries.push(sql);
    if(req.body.freightGST){
        const gst = `
        INSERT INTO simply.tPOLineT (lPORecId, nLineNum, lTaxAuth, bExempt, bTaxAmtDef, dTaxAmt)
        VALUES('${req.body.newID}', '${req.body.items.length + 1}', '1', '0', '1', '${req.body.freightGST}');
        `;
        queries.push(gst);
    }
    if(req.body.freightPST){
        const pst = `
        INSERT INTO simply.tPOLineT (lPORecId, nLineNum, lTaxAuth, bExempt, bTaxAmtDef, dTaxAmt)
        VALUES('${req.body.newID}', '${req.body.items.length + 1}', '2', '0', '1', '${req.body.freightPST}');
        `;
        queries.push(pst);
    }
    const totalGst = `
    INSERT INTO simply.tPOToT(lPOId, lTaxAuth, dTaxAmt, dNonRef)
    VALUES('${req.body.newID}', '1', '${req.body.gstTotalRef}', '${req.body.gstTotalNonRef}');
    `;
    const totalPst = `
    INSERT INTO simply.tPOToT(lPOId, lTaxAuth, dTaxAmt, dNonRef)
    VALUES('${req.body.newID}', '2', '${req.body.pstTotalRef}', '${req.body.pstTotalNonRef}');
    `;
    queries.push(totalGst, totalPst);

    let index = 0;    
    const dbPromise = (query) => db.promise().query(query).then(()=>{
        index = index + 1;
        if(index<queries.length){dbPromise(queries[index]);}
        else{res.json({message: 'success'});}
    }).catch((err) => res.status(500).json({ error: err.message }));

    dbPromise(queries[index]);
});

module.exports = router;