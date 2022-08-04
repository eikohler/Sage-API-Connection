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

    req.body.items.forEach(item => {
      let sql = `
      INSERT INTO simply.tITLULi (lITRecId, nLineNum, sItem, sUnits, nUnitType, sDesc, dAmtInclTx, dOrdered, dRemaining, dPrice, dDutyPer, dDutyAmt, bFreight, lTaxCode, lTaxRev, dTaxAmt, bTSLine, dBasePrice, dLineDisc, dVenRel, bVenToStk, bDefDesc, nLineFrom, dDOQty)
      VALUES ('${req.body.newID}', '${item.lineNum}', '${item.sPartCode}', '${item.sBuyUnit}', '1', '${item.description}', '${item.userInput.amount}', '${item.userInput.orderQuantity}', '${item.userInput.backOrderQuantity}', '${item.userInput.price}', '0', '0', '0', '${item.userInput.taxCode}', '16', '${item.userInput.taxAmt}', '0', '${item.userInput.price}', '0', '0', '0', '0', '${item.lineNum}', '0');
      `;
      queries.push(sql);

      sql = `
      INSERT INTO simply.tITRLine (lITRecId, nLineNum, sSource, lInventId, lAcctId, dQty, dPrice, dAmt, dCost, dRev, bTsfIn, bVarLine, bReversal, bService, lAcctDptId, lInvLocId, bDefPrc, lPrcListId, dBasePrice, dLineDisc, bDefBsPric, bDelInv, bUseVenItm, dOrgInvQty, dOrgInvAmt, nTransFrom)
      VALUES ('${req.body.newID}', '${item.lineNum}', '${item.sPartCode}', '${item.lId}', '${req.body.customer.lAcDefRev}', '${item.userInput.quantity}', '${item.userInput.price}', '${item.userInput.amount}', '0', '${item.userInput.amount}', '0', '0', '0', '0', '0', '${req.body.customer.locationID}', '0', '20', '${item.userInput.price}', '0', '0', '0', '0', '0', '0', '1');
      `;
      queries.push(sql);

      if(item.userInput.gst){
          const gst = `
          INSERT INTO simply.tITLULiT (lITRecId, nLineNum, lTaxAuth, bExempt, dTaxAmt, lDeptId)
          VALUES ('${req.body.newID}', '${item.lineNum}', '1', '0', '${item.userInput.gst}', '0');
          `;
          queries.push(gst);
      }
      if(item.userInput.pst){
          const pst = `
          INSERT INTO simply.tITLULiT (lITRecId, nLineNum, lTaxAuth, bExempt, dTaxAmt, lDeptId)
          VALUES ('${req.body.newID}', '${item.lineNum}', '2', '0', '${item.userInput.pst}', '0');
          `;
          queries.push(pst);
      }
    });
    sql = `
    INSERT INTO simply.tITLULi (lITRecId, nLineNum, sItem, sUnits, nUnitType, sDesc, dAmtInclTx, dOrdered, dRemaining, dPrice, dDutyPer, dDutyAmt, bFreight, lTaxCode, lTaxRev, dTaxAmt, bTSLine, dBasePrice, dLineDisc, dVenRel, bVenToStk, bDefDesc, nLineFrom, dDOQty)
    VALUES ('${req.body.newID}', '${req.body.items.length + 1}', '', '', '0', '', '${req.body.freightAmt}', '0', '0', '0', '0', '0', '1', '${req.body.freightTaxCode}', '16', '${req.body.freightTaxAmt}', '0', '0', '0', '0', '0', '0', '0', '0');
    `;
    queries.push(sql);

    let lineNum = req.body.items.length;
    if(req.body.freightGST){
        lineNum = lineNum + 1;
        const gst = `
        INSERT INTO simply.tITLULiT (lITRecId, nLineNum, lTaxAuth, bExempt, dTaxAmt, lDeptId)
        VALUES ('${req.body.newID}', '${lineNum}', '1', '0', '${req.body.freightGST}', '0');
        `;
        queries.push(gst);
    }
    if(req.body.freightPST){
        lineNum = lineNum + 1;
        const pst = `
        INSERT INTO simply.tITLULiT (lITRecId, nLineNum, lTaxAuth, bExempt, dTaxAmt, lDeptId)
        VALUES ('${req.body.newID}', '${lineNum}', '1', '0', '${req.body.freightPST}', '0');
        `;
        queries.push(pst);
    }
    const totalGst = `
    INSERT INTO simply.tITLUToT (lITRecId, lTaxAuth, dTaxAmt, dNonRef)
    VALUES ('${req.body.newID}', '1', '${req.body.gstTotalRef}', '${req.body.gstTotalNonRef}');
    `;
    const totalPst = `
    INSERT INTO simply.tITLUToT (lITRecId, lTaxAuth, dTaxAmt, dNonRef)
    VALUES ('${req.body.newID}', '2', '${req.body.pstTotalRef}', '${req.body.pstTotalNonRef}');
    `;
    queries.push(totalGst, totalPst);

    let index = 0;
    const dbPromise = (query) => db.promise().query(query).then(()=>{
        index = index + 1;
        if(index<queries.length){
          // console.log(queries[index]);
          dbPromise(queries[index]);
        }
        else{res.json({message: 'success'});}
    }).catch((err) => res.status(500).json({ error: err.message }));

    dbPromise(queries[index]);
});

module.exports = router;