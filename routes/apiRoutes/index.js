const express = require('express');
const router = express.Router();
const vendorRoutes = require('./vendorRoutes');
const customerRoutes = require('./customerRoutes');
const ordersRoutes = require('./ordersRoutes');
const pOrderRoutes = require('./pOrderRoutes');
const salesOrderRoutes = require('./salesOrderRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const taxRoutes = require('./taxRoutes');
const locRoutes = require('./locRoutes');
const employeeRoutes = require('./employeeRoutes');

router.use('/vendors', vendorRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', ordersRoutes);
router.use('/purOrder', pOrderRoutes);
router.use('/salesOrder', salesOrderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/tax', taxRoutes);
router.use('/locations', locRoutes);
router.use('/employees', employeeRoutes);

module.exports = router;