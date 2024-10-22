const express = require("express");
const applicationRoute = express.Router({ mergeParams: true });
const versionMiddleware = require("../../middleware/versionMiddleware");

// Application Handlers
const createApplication = require("./createApplication");
const getApplication = require("./getApplication");
const getApplications = require("./getApplications");
const updateApplication = require("./updateApplication");
const cancelApplication = require("./cancelApplication");
const deleteApplication = require("./deleteApplication");

// Attendance Handlers
const getApplicationFromQrString = require("./getApplicationFromQrString");
const requestAttendanceCheck = require("./requestAttendanceCheck");
const approveAttendanceCheck = require("./approveAttendanceCheck");

// Cancel Application
applicationRoute.put("/:id/cancel", versionMiddleware(1), cancelApplication.v1);

// Request Attendance Check
applicationRoute.put(
  "/:id/attendance-check",
  versionMiddleware(1),
  requestAttendanceCheck.v1
);

// Get Applications
applicationRoute.get("/:id", versionMiddleware(1), getApplications.v1);

// Update Application
applicationRoute.put("/:id", versionMiddleware(1), updateApplication.v1);

// Delete Application
applicationRoute.delete("/:id", versionMiddleware(1), deleteApplication.v1);

// Get Application From QR String
applicationRoute.get(
  "/attendance-check",
  versionMiddleware(1),
  getApplicationFromQrString.v1
);

// Approve Attendance Check
applicationRoute.put(
  "/attendance-check",
  versionMiddleware(1),
  approveAttendanceCheck.v1
);

// Create Application
applicationRoute.post("/", versionMiddleware(1), createApplication.v1);

// Get Application
applicationRoute.get("/", versionMiddleware(1), getApplication.v1);

module.exports = applicationRoute;
