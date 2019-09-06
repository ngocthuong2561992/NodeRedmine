const mongoose = require('mongoose');
const { schema } = require('./schema');
const User = mongoose.model('User', schema, 'user');
const UserTemp = mongoose.model('UserTemp', schema, 'userTemp');

module.exports = { User, UserTemp };
