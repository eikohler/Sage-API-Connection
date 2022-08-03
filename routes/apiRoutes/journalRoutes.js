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
    VALUES ('${req.body.newJEntID}', CURRENT_TIMESTAMP, '1899-12-30 16:03:18', 'sysadmin', 'winsim', '${req.body.orderDate}', '2', '1', '${req.body.orderNum}', '${req.body.customer.sName}', '1', '0', '${req.body.customer.lId}', '0', '', NULL, '0', '1', '0', '0', '0', '0');
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