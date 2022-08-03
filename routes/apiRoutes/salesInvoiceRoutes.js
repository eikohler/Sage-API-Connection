const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

router.get('/lastID', (req, res) => {
    const sql = `SELECT lITRecId FROM simply.tITLU ORDER BY lITRecId DESC LIMIT 0, 1;`;
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
    INSERT INTO simply.tITLU (lITRecId, sName, sAddress1, sAddress2, sAddress3, sAddress4, sAddress5, sShipTo1, sShipTo2, sShipTo3, sShipTo4, sShipTo5, sShipTo6, dTotal, nTSActSort, dtTSStart, dtTSEnd, sPONum, sShpprName, sTrackingN, lAcctId, bDistByAmt, b40Data, bDeleted, bNotRecd, bFromPO, lAcctDptId, bAlocToAll, nTmplType, lAddrId, dtShipDate, nLangPref, bUseVenItm, lProjId)
    VALUES('${req.body.newID}', '${req.body.customer.sName}', '${req.body.customer.sStreet1}', '${req.body.customer.sStreet2}', '${req.body.customer.sCity}', '${req.body.customer.sProvState}', '${req.body.customer.sPostalZip}', '${req.body.shipTo[0]}', '${req.body.shipTo[1]}', '${req.body.shipTo[2]}', '${req.body.shipTo[3]}', '${req.body.shipTo[4]}', '${req.body.shipTo[5]}', '${req.body.totalAmt}', '1', '2017-05-01 00:00:00', '2017-06-30 00:00:00', '${req.body.orderSelectName}', '', '', '0', '0', '0', '0', '0', '${req.body.bFromPO}', '0', '1', '0', '${req.body.customer.shipID}', '${req.body.shipDate}', '0', '0', '0');
    `;
    queries.push(sql);   

    sql = `
    INSERT INTO simply.tITRec(lId, dtASDate, tmASTime, sASUserId, sASOrgId, lVenCusId, lJourId, nTsfIn, nJournal, dtJournal, dtUsing, sComment, sSource1, sSource2, sRef, dFreight, dInvAmt, fDiscPer, nDiscDay, nNetDay, dDiscAmt, bCashTrans, bCashAccnt, b40Data, bReversal, bReversed, bFromPO, bPdByCash, bPdbyCC, bDiscBfTax, bFromImp, bUseMCurr, bLUCleared, bStoreDuty, lCurIdUsed, dExchRate, sSource3, bPrinted, bEmailed, lChqId, sUser, bChallan, bPaidByWeb, nOrdType, bPrePaid, lOrigPPId, lPPId, dPrePAmt, lSoldBy, szSoldBy, bDSProc, lInvLocId, bTrfLoc, bRmBPLst, bPSPrintd, bPSRmBPLst, lCCTransId, bPdByDP, sOrgInvNum, dOrgInvFrt, bDOClear, bIFRS, lUGSAcctId, dDOInvAmt, dDOInvAmtF)
    VALUES('${req.body.newID}', CURRENT_TIMESTAMP, '1899-12-30 16:03:18', 'sysadmin', 'winsim', '${req.body.customer.lId}', '${req.body.newJEntID}', '0', '8', '2017-06-13 00:00:00', '2017-06-30 00:00:00', '${req.body.message}', '${req.body.orderNum}', '', '', '${req.body.freightAmt}', '${req.body.totalAmt}', '0', '0', '0', '0', '0', '0', '0', '0', '0', '${req.body.bFromPO}', '0', '0', '0', '0', '0', '0', '0', '1', '0', '', '0', '0', '0', 'sysadmin', '0', '0', '1', '0', '0', '0', '0', '${req.body.salesManID}', '${req.body.salesManName}', '0', '${req.body.customer.locationID}', '0', '0', '0', '0', '0', '0', '', '0', '0', '0', '0', '0', '0');
    `;
    queries.push(sql);    

    let index = 0;    
    const dbPromise = (query) => db.promise().query(query).then(()=>{
        index = index + 1;
        if(index<queries.length){dbPromise(queries[index]);}
        else{res.json({message: 'success'});}
    }).catch((err) => res.status(500).json({ error: err.message }));

    dbPromise(queries[index]);
});

module.exports = router;