const express = require('express');
const systemRoute = express.Router({ mergeParams: true });
const versionMiddleware = require('../../middleware/versionMiddleware');
const { protect, authorize } = require('../../middleware/auth');

// Handlers
const getSystemSetting = require('./getSystemSettings');
const updateSystemSetting = require('./updateSystemSetting');

// get system setting
systemRoute.get('/', versionMiddleware(1), protect, getSystemSetting.v1);

// update system setting
systemRoute.put('/', versionMiddleware(1), protect, authorize('applicationAdmin'), updateSystemSetting.v1);

// export
module.exports = systemRoute;