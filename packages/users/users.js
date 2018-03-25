const express = require('express');
const router = express.Router();
const db = require('../database/db.js');

/* GET users listing. */
router.get('/', (req, res) => {
  const result = { status: 'OK', data: [] };

  db.each('SELECT name, surname, age FROM users', (err, row) => {
    result.data.push(row);
  }, () => {
    res.json(result);
  });
});

module.exports = router;
