const mongoose = require('mongoose');
const { schema } = require('./schema');
const syncData = mongoose.model('syncData', schema, 'syncData');

module.exports = { syncData };
