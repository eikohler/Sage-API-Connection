const router = require('express').Router();

router.get('/', (req, res) => {
  res.render('sales-invoice');
});

router.get('/purchase-order', (req, res) => {
  res.render('purchase-order');
});

router.get('*', (req, res) => {
  res.status(404).end();
});

module.exports = router;