const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

router.get('/', (req, res) => {
    const sql = `SELECT lId, sName FROM simply.tCustomr
    WHERE bInactive = 0
    Order By sName ASC;`;
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
  const sql = `SELECT simply.tCustomr.lId, simply.tCustomr.sName, lSalManID, sStreet1, sStreet2, sCity, sProvState, sCountry, sPostalZip, sCntcName, lTaxCode, lAcDefRev, lInvLocId, simply.tAccount.sName AS accountName,
  simply.tCustShp.sAddrName, simply.tCustShp.sShipCntc, simply.tCustShp.sShipStrt1, simply.tCustShp.sShipCity, simply.tCustShp.sShipPrvSt, simply.tCustShp.sShipPstZp, simply.tCustShp.sShipCnty
  FROM simply.tCustomr
  LEFT JOIN simply.tAccount ON lAcDefRev=simply.tAccount.lId
  LEFT JOIN simply.tCustShp ON simply.tCustShp.lCustId=simply.tCustomr.lId
  WHERE simply.tCustomr.lId = ${req.params.id}`;

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
