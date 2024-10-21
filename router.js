const express = require("express");
const router = express.Router({ mergeParams: true });
const api = require('./api');

router.use('/api/:version/semesters', api.semester);
router.use('/api/:version/tags', api.tag);
router.use('/api/:version/applications', api.applications);

router.get('/', (req, res) => {
  res.send('main page')
})

module.exports = router;