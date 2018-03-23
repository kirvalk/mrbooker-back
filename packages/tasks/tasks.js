var express = require('express');
var router = express.Router();

/* GET tasks listing. */
router.get('/', function(req, res, next) {
  res.json({ status: 'OK' });
});

module.exports = router;
