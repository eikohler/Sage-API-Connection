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

module.exports = router;
