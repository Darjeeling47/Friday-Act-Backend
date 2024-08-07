const express = require('express');
const semestersRoute = express.Router({ mergeParams: true });
const versionMiddleware = require('../../middleware/versionMiddleware');

// Handlers
const createSemester = require('./createSemester')
const getSemester = require('./getSemester');
const getSemesters = require('./getSemesters');
const updateSemester = require('./updateSemester');
const deleteSemester = require('./deleteSemester');

// create a semester
semestersRoute.post('/', versionMiddleware(1), createSemester.v1);

// get many semester
semestersRoute.get('/', versionMiddleware(1), getSemesters.v1);

// get one semester
semestersRoute.get('/:semesterId', versionMiddleware(1), getSemester.v1);

// update a semester
semestersRoute.put('/:semesterId', versionMiddleware(1), updateSemester.v1);

// delete a semester
semestersRoute.delete('/:semesterId', versionMiddleware(1), deleteSemester.v1);

// export
module.exports = semestersRoute;