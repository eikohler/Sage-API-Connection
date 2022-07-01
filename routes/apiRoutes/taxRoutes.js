const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

router.get('/', (req, res) => {
    const sql = `SELECT lId, sCode, sDesc FROM simply.tTaxCode
    WHERE dtASDate >= '2015-10-27 00:00:00';`;
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
  const sql = `SELECT codes.lId, codes.sCode, codes.sDesc, info.lTaxAuth, info.dPct, info.bRefundbl FROM simply.tTaxCode AS codes
  LEFT JOIN (SELECT a.lTaxId, a.lTaxAuth, a.lFirstRev, a.dPct, a.bRefundbl FROM simply.tTxCdDtl a
  INNER JOIN (
      SELECT lTaxId, MAX(lFirstRev) AS rev
      FROM simply.tTxCdDtl
      GROUP BY lTaxId
  ) AS b ON a.lTaxId = b.lTaxId AND a.lFirstRev = b.rev) AS info ON codes.lId = info.lTaxId
  WHERE dtASDate >= '2015-10-27 00:00:00' AND codes.lId = ${req.params.id};`;
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
