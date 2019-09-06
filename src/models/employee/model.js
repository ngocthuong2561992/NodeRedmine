const mongoose = require('mongoose');
const { schema } = require('./schema');
const Employee = mongoose.model('Employee', schema, 'employee');

module.exports = { Employee };
