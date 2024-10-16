const express = require("express");
const router = express.Router({ mergeParams: true });
const api = require('./api');

router.use('/api/:version/semesters', api.semesters);
router.use('/api/:version/tags', api.tags);
router.use('/api/:version/activities', api.activities);

router.get('/', (req, res) => {
  res.send('main page')
})

module.exports = router;