const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

router.get('/vendors', (req, res) => {
    const sql = `SELECT * FROM tVendor`;
  
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
