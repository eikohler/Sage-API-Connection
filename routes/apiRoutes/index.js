const express = require('express');
const router = express.Router();
const vendorRoutes = require('./vendorRoutes');
const customerRoutes = require('./customerRoutes');
const ordersRoutes = require('./ordersRoutes');
const pOrderRoutes = require('./pOrderRoutes');
const salesOrderRoutes = require('./salesOrderRoutes');
const salesInvoiceRoutes = require('./salesInvoiceRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const taxRoutes = require('./taxRoutes');
const locRoutes = require('./locRoutes');
const employeeRoutes = require('./employeeRoutes');
const journalRoutes = require('./journalRoutes');

router.use('/vendors', vendorRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', ordersRoutes);
router.use('/purOrder', pOrderRoutes);
router.use('/salesOrder', salesOrderRoutes);
router.use('/salesInvoice', salesInvoiceRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/tax', taxRoutes);
router.use('/locations', locRoutes);
router.use('/employees', employeeRoutes);
router.use('/journals', journalRoutes);

module.exports = router;