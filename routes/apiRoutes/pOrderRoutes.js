const uuid = require('uuid');
const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

router.get('/uuid', (req, res) => {
    let id = uuid.v1();
    res.json({
        uuid: id
    });
});

router.get('/lastID', (req, res) => {
    const sql = `SELECT lId FROM simply.tPurOrdr ORDER BY lId DESC LIMIT 0, 1;`;
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
    const sql = `
    INSERT INTO simply.tPurOrdr (lId, lVenId, sPONum, dtASDate, tmASTime, sASUserId, sASOrgId, sName, sFrom1, sFrom2, sFrom3, sFrom4, sFrom5, sShipTo1, sShipTo2, sShipTo3, sShipTo4, sShipTo5, sShipTo6, dtReqDate, dtPODate, bPrinted, bEmailed, sUser, fDiscPer, nDiscDay, nNetDay, dTotal, lNxtJourId, sShipper, bQuote, bImport, bDutyStore, lCurrncyId, dExchRate, bPrePaid, lPaidJor, nPdType, sCrdName, lAcctNum, lDepId, bCleared, lChqId, lInvLocId, bRmBPLst, nLangPref, nFilled, bReversed, bReversal, bUseVenItm)
    VALUES('${req.body.newID}', '${req.body.vendor.lId}', '${req.body.orderNum}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'sysadmin', 'winsim', '${req.body.vendor.sName}', '${req.body.vendor.sStreet1}', '${req.body.vendor.sStreet2}', '${req.body.vendor.sCity}', '${req.body.vendor.sProvState}', '${req.body.vendor.sPostalZip}', '${req.body.shipTo[0]}', '${req.body.shipTo[1]}', '${req.body.shipTo[2]}', '${req.body.shipTo[3]}', '${req.body.shipTo[4]}', '${req.body.shipTo[5]}', '${req.body.shipDate}', '${req.body.orderDate}', '0', '0', 'sysadmin', '0', '0', '0', '${req.body.totalAmt}', '28805', '', '0', '0', '0', '1', '0', '0', '0', '0', '', '0', '0', '0', '0', '${req.body.locationID}', '0', '0', '0', '0', '0', '0');
    `;

    console.log(sql);

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
