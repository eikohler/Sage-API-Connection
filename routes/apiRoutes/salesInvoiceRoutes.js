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
    // req.body.items.forEach(item => {
    //     const sql = `
    //     INSERT INTO simply.tSOLine (lSOId, nLineNum, lInventId, sPartCode, dQuantity, dOrdered, dRemaining, sUnits, nUnitType, sDesc, dPrice, lTaxCode, lTaxRev, bFreight, dAmount, lAcctId, bInvItem, lAcctDptId, lInvLocId, bDefPrc, lPrcListId, dBasePrice, dLineDisc, bDefBsPric)
    //     VALUES('${req.body.newID}', '${item.lineNum}', '${item.lId}', '${item.sPartCode}', '${item.dInStock}', '${item.userInput.orderQuantity}', '${item.userInput.backOrderQuantity}', '${item.sBuyUnit}', '1', '${item.description}', '${item.userInput.price}', '${item.userInput.taxCode}', '16', '0', '${item.userInput.amount}', '${req.body.customer.lAcDefRev}', '1', '0', '1', '${item.userInput.bDefPrice}', '28', '${item.userInput.price}', '0', '0');
    //     `;
    //     queries.push(sql);
    //     if(item.userInput.gst){
    //         const gst = `
    //         INSERT INTO simply.tSOLineT (lSORecId, nLineNum, lTaxAuth, bExempt, bTaxAmtDef, dTaxAmt)
    //         VALUES('${req.body.newID}', '${item.lineNum}', '1', '0', '1', '${item.userInput.gst}');
    //         `;
    //         queries.push(gst);
    //     }
    //     if(item.userInput.pst){
    //         const pst = `
    //         INSERT INTO simply.tSOLineT (lSORecId, nLineNum, lTaxAuth, bExempt, bTaxAmtDef, dTaxAmt)
    //         VALUES('${req.body.newID}', '${item.lineNum}', '2', '0', '1', '${item.userInput.pst}');
    //         `;
    //         queries.push(pst);
    //     }        
    // });
    // sql = `
    // INSERT INTO simply.tSOLine (lSOId, nLineNum, lInventId, sPartCode, dQuantity, dOrdered, dRemaining, sUnits, nUnitType, sDesc, dPrice, lTaxCode, lTaxRev, bFreight, dAmount, lAcctId, bInvItem, lAcctDptId, lInvLocId, bDefPrc, lPrcListId, dBasePrice, dLineDisc, bDefBsPric)
    // VALUES('${req.body.newID}', '${req.body.items.length + 1}', '0', '', '0', '0', '0', '', '1', '', '0', '${req.body.freightTaxCode}', '16', '1', '${req.body.freightAmt}', '42500000', '0', '0', '1', '0', '1', '0', '0', '0');
    // `;
    // queries.push(sql);
    // if(req.body.freightGST){
    //     const gst = `
    //     INSERT INTO simply.tSOLineT (lSORecId, nLineNum, lTaxAuth, bExempt, bTaxAmtDef, dTaxAmt)
    //     VALUES('${req.body.newID}', '${req.body.items.length + 1}', '1', '0', '1', '${req.body.freightGST}');
    //     `;
    //     queries.push(gst);
    // }
    // if(req.body.freightPST){
    //     const pst = `
    //     INSERT INTO simply.tSOLineT (lSORecId, nLineNum, lTaxAuth, bExempt, bTaxAmtDef, dTaxAmt)
    //     VALUES('${req.body.newID}', '${req.body.items.length + 1}', '2', '0', '1', '${req.body.freightPST}');
    //     `;
    //     queries.push(pst);
    // }
    // const totalGst = `
    // INSERT INTO simply.tSOToT(lSORecId, lTaxAuth, dTaxAmt, dNonRef)
    // VALUES('${req.body.newID}', '1', '${req.body.gstTotalRef}', '${req.body.gstTotalNonRef}');
    // `;
    // const totalPst = `
    // INSERT INTO simply.tSOToT(lSORecId, lTaxAuth, dTaxAmt, dNonRef)
    // VALUES('${req.body.newID}', '2', '${req.body.pstTotalRef}', '${req.body.pstTotalNonRef}');
    // `;
    // queries.push(totalGst, totalPst);

    let index = 0;    
    const dbPromise = (query) => db.promise().query(query).then(()=>{
        index = index + 1;
        if(index<queries.length){dbPromise(queries[index]);}
        else{res.json({message: 'success'});}
    }).catch((err) => res.status(500).json({ error: err.message }));

    dbPromise(queries[index]);
});

module.exports = router;