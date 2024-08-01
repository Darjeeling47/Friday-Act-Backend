const express = require("express");
const router = express.Router(merge);
const api = require('./api');

app.use('/api/:version/semesters', api.semester);

module.exports = router;