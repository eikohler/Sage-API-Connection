const express = require('express');
const router = express.Router();

const apiRoutes = require('./apiRoutes');
const pageRoutes = require('./pageRoutes');

router.use('/api', apiRoutes);
router.use('/', pageRoutes);

module.exports = router;