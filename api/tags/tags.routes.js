const express = require('express');
const tagsRoute = express.Router({ mergeParams: true });
const versionMiddleware = require('../../middleware/versionMiddleware');

// Handlers
const createTag = require('./createTag');
const getTag = require('./getTag');
const getTags = require('./getTags');
const updateTag = require('./updateTag');
const deleteTag = require('./deleteTag');

// create a semester
semestersRoute.post('/', versionMiddleware(1), createSemester.v1);

// get many semester
semestersRoute.get('/', versionMiddleware(1), getSemesters.v1);

// get one semester
semestersRoute.get('/:semesterId', versionMiddleware(1), getSemester.v1);

// update a semester
semestersRoute.put('/', versionMiddleware(1), updateSemester.v1);

// delete a semester
semestersRoute.delete('/', versionMiddleware(1), deleteSemester.v1);

// export
module.exports = semestersRoute;