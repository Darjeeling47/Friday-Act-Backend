const express = require('express');
const activitiesRoute = express.Router({ mergeParams: true });
const versionMiddleware = require('../../middleware/versionMiddleware');
const {protect, authorize} = require('../../middleware/auth');

// Handlers
const createActivity = require('./createActivity');
const getActivities = require('./getActivities');
const getActivity = require('./getActivity');
const updateActivity = require('./updateActivity');
const deleteActivity = require('./deleteActivity');

// create a new activity
activitiesRoute.post('/', versionMiddleware(1), protect, authorize('applicationAdmin'), createActivity.v1);
activitiesRoute.get('/', versionMiddleware(1), protect, getActivities.v1);
activitiesRoute.get('/:id', versionMiddleware(1), protect, getActivity.v1);
activitiesRoute.put('/:id', versionMiddleware(1), protect, authorize('applicationAdmin'), updateActivity.v1);
activitiesRoute.delete('/:id', versionMiddleware(1), protect, authorize('applicationAdmin'), deleteActivity.v1);

// export
module.exports = activitiesRoute;