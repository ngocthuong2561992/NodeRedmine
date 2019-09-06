const mongoose = require('mongoose');
const { schema } = require('./schema');
const holiday = mongoose.model('holiday', schema, 'holiday');

module.exports = { holiday };
