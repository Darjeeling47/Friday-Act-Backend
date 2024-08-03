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
tagsRoute.post('/', versionMiddleware(1), createTag.v1);

// get many semester
tagsRoute.get('/', versionMiddleware(1), getTags.v1);

// get one semester
tagsRoute.get('/:tagId', versionMiddleware(1), getTag.v1);

// update a semester
tagsRoute.put('/', versionMiddleware(1), updateTag.v1);

// delete a semester
tagsRoute.delete('/', versionMiddleware(1), deleteTag.v1);

// export
module.exports = tagsRoute;