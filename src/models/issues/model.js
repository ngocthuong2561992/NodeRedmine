const mongoose = require('mongoose');
const { schema } = require('./schema');
const issues = mongoose.model('issues', schema, 'issues');
const issuesTemp = mongoose.model('issuesTemp', schema, 'issuesTemp');

module.exports = { issues, issuesTemp };