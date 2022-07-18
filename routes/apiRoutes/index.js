const express = require('express');
const router = express.Router();
const vendorRoutes = require('./vendorRoutes');
const customerRoutes = require('./customerRoutes');
const pOrderRoutes = require('./pOrderRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const taxRoutes = require('./taxRoutes');
const locRoutes = require('./locRoutes');

router.use('/vendors', vendorRoutes);
router.use('/customers', customerRoutes);
router.use('/purOrder', pOrderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/tax', taxRoutes);
router.use('/locations', locRoutes);

module.exports = router;