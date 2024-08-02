const express = require("express");
const router = express.Router({ mergeParams: true });
const api = require('./api');

router.use('/api/:version/semesters', api.semester);

router.get('/', (req, res) => {
  res.send('main page')
})

module.exports = router;