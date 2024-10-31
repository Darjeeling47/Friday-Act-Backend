const express = require("express");
const router = express.Router({ mergeParams: true });
const api = require('./api');
const path = require('path');

router.use('/api/:version/semesters', api.semesters);
router.use('/api/:version/tags', api.tags);
router.use('/api/:version/activities', api.activities);
router.use('/api/:version/setting/system', api.systemSettings);

router.use('/image/activities/poster', express.static(path.join(__dirname, 'image', 'activities', 'poster')));

router.get('/', (req, res) => {
  res.send('main page')
})

module.exports = router;