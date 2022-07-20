const router = require('express').Router();

router.get('/', (req, res) => {
  res.render('sales-order', { sales: true });
});

router.get('/sales-invoice', (req, res) => {
  res.render('sales-invoice', { sales: true });
});

router.get('/purchase-order', (req, res) => {
  res.render('purchase-order', { sales: false });
});

router.get('*', (req, res) => {
  res.status(404).end();
});

module.exports = router;