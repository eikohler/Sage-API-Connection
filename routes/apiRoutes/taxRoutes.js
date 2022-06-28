const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

router.get('/', (req, res) => {
    const sql = `SELECT lId, sCode, sDesc FROM simply.tTaxCode
    WHERE lId IN (1, 21, 23, 25, 26, 28, 29, 30)
    AND sDesc NOT IN ('GST 7%')
    GROUP BY lId;`;
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
