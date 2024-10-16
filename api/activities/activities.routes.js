const express = require('express');
const activitiesRoute = express.Router({ mergeParams: true });
const versionMiddleware = require('../../middleware/versionMiddleware');
const {protect, authorize} = require('../../middleware/auth');

// Handlers
const createActivity = require('./createActivity');

// create a new activity
activitiesRoute.post('/', versionMiddleware(1), protect, authorize('applicationAdmin'), createActivity.v1);

// export
module.exports = activitiesRoute;