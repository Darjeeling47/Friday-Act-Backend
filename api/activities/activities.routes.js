const express = require('express');
const activitiesRoute = express.Router({ mergeParams: true });
const versionMiddleware = require('../../middleware/versionMiddleware');

// Handlers
const createActivity = require('./createActivity');

// create a semester
activitiesRoute.post('/', versionMiddleware(1), createActivity.v1);

// export
module.exports = activitiesRoute;