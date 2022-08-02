const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

router.get('/lastID', (req, res) => {
    const sql = `SELECT lId FROM simply.tJourEnt ORDER BY lId DESC LIMIT 0, 1;`;
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
    INSERT INTO simply.tJourEnt (lId, dtASDate, tmASTime, sASUserId, sASOrgId, dtJourDate, nModule, nType, sSource, sComment, lCurrncyId, dExchRate, lRecId, nPymtClass, sComment2, dtCmt2Date, bExported, lCompId, bAcctEntry, bAEImport, bAftYEnd, bB4YrStart)
    VALUES ('${req.body.newJEntID}', 'CURRENT_TIMESTAMP', '1899-12-30 16:03:18', 'sysadmin', 'winsim', '${req.body.orderDate}', '2', '1', '${req.body.orderNum}', '${req.body.customer.sName}', '1', '0', '${req.body.customer.lId}', '0', '', NULL, '0', '1', '0', '0', '0', '0');
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