const mongoose = require('mongoose');
const { schema } = require('./schema');
const NonWorking = mongoose.model('NonWorking', schema, 'NonWorking');

module.exports = NonWorking;
