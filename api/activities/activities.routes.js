const express = require('express');
const activitiesRoute = express.Router({ mergeParams: true });
const versionMiddleware = require('../../middleware/versionMiddleware');
const {protect, authorize} = require('../../middleware/auth');

// Handlers
const createActivity = require('./createActivity');
const getActivities = require('./getActivities');
const getActivity = require('./getActivity');

// create a new activity
activitiesRoute.post('/', versionMiddleware(1), protect, authorize('applicationAdmin'), createActivity.v1);
activitiesRoute.get('/', versionMiddleware(1), protect, getActivities.v1);
activitiesRoute.get('/:id', versionMiddleware(1), protect, getActivity.v1);

// export
module.exports = activitiesRoute;