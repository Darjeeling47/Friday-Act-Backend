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
const { protect, authorize } = require("../../middleware/auth");

// Cancel Application
applicationRoute.put("/:id/cancel", protect, versionMiddleware(1), cancelApplication.v1);

// Request Attendance Check
applicationRoute.put(
  "/:id/attendance-check",
  versionMiddleware(1),
  requestAttendanceCheck.v1
);

// Get Applications
applicationRoute.get("/:id", versionMiddleware(1), getApplication.v1);

// Update Application
applicationRoute.put("/:id", protect, versionMiddleware(1), updateApplication.v1);

// Delete Application
applicationRoute.delete("/:id", protect, authorize("applicationAdmin"), versionMiddleware(1), deleteApplication.v1);

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
applicationRoute.post("/", protect, authorize("applicationAdmin"), versionMiddleware(1), createApplication.v1);

// Get Application
applicationRoute.get("/", protect, authorize("applicationAdmin"), versionMiddleware(1), getApplication.v1);

module.exports = applicationRoute;
