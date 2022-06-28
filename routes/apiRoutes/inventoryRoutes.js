const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

router.get('/', (req, res) => {
    const sql = `SELECT lId, sPartCode, sName FROM simply.tInvent
    WHERE bInactive = 0
    order by sPartCode ASC;`;
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

router.get('/:id', (req, res) => {
  const sql = `SELECT simply.tInvent.lId, sPartCode, simply.tInvent.sName, sBuyUnit, lAcNAsset, simply.tInvByLn.dLastPPrce, simply.tAccount.sName
  FROM simply.tInvent
  LEFT JOIN simply.tInvByLn ON simply.tInvent.lId=simply.tInvByLn.lInventId
  LEFT JOIN simply.tAccount ON lAcNAsset=simply.tAccount.lId
  WHERE simply.tInvent.lId = ${req.params.id}
  GROUP BY simply.tInvByLn.dLastPPrce;`;

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

router.post('/item-by-location', (req, res) => {
    const sql = `SELECT simply.tInvent.lId, sPartCode, simply.tInvent.sName, sBuyUnit, lAcNAsset, simply.tInvByLn.lInvLocId, simply.tInvByLn.dInStock, simply.tInvByLn.dLastPPrce, simply.tAccount.sName
    FROM simply.tInvent
    LEFT JOIN simply.tInvByLn ON simply.tInvent.lId=simply.tInvByLn.lInventId
    LEFT JOIN simply.tAccount ON lAcNAsset=simply.tAccount.lId
    WHERE simply.tInvent.lId = ${req.body.id} AND simply.tInvByLn.lInvLocId = ${req.body.locID};`
  
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

module.exports = router;
