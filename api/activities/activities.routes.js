const express = require('express');
const activitiesRoute = express.Router({ mergeParams: true });
const versionMiddleware = require('../../middleware/versionMiddleware');
const {protect, authorize} = require('../../middleware/auth');
const multer = require('multer');

// Set storage engine
const storage = multer.memoryStorage(); // Store file in memory as a buffer
const upload = multer({ storage: storage });

// Handlers
const createActivity = require('./createActivity');
const getActivities = require('./getActivities');
const getActivity = require('./getActivity');
const updateActivity = require('./updateActivity');
const deleteActivity = require('./deleteActivity');
const getActivityParticipants = require('./getActivityParticipants');

// create a new activity
activitiesRoute.post('/', upload.single('poster'), versionMiddleware(1), createActivity.v1);
activitiesRoute.get('/', versionMiddleware(1), protect, getActivities.v1);
activitiesRoute.get('/:id', versionMiddleware(1), protect, getActivity.v1);
activitiesRoute.put('/:id', versionMiddleware(1), protect, authorize('applicationAdmin'), updateActivity.v1);
activitiesRoute.delete('/:id', versionMiddleware(1), protect, authorize('applicationAdmin'), deleteActivity.v1);
activitiesRoute.get('/:id/participants', versionMiddleware(1), protect, authorize('applicationAdmin'), getActivityParticipants.v1);

// export
module.exports = activitiesRoute;