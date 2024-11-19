const express = require("express");
const companiesRoute = express.Router({ mergeParams: true });
const versionMiddleware = require("../../middleware/versionMiddleware");

const getCompany = require('./getCompany');
const getCompanies = require('./getCompanies');

const { protect, authorize } = require("../../middleware/auth");

companiesRoute.get("/:id", versionMiddleware(1), getCompany.v1);
companiesRoute.get("/", versionMiddleware(1), getCompanies.v1);

module.exports = companiesRoute;