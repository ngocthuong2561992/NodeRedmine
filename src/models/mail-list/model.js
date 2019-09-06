const mongoose = require('mongoose');
const { schema } = require('./schema');
const MailList = mongoose.model('MailList', schema, 'MailList');

module.exports = MailList;
