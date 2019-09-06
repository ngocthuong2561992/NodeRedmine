const mongoose = require('mongoose');
const { schema } = require('./schema');
const timeEntries = mongoose.model('timeEntries', schema, 'timeEntries');
const timeEntriesTemp = mongoose.model('timeEntriesTemp', schema, 'timeEntriesTemp');

module.exports = { timeEntries, timeEntriesTemp };