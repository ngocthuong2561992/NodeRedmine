const mongoose = require('mongoose');
const { schema } = require('./schema');
const Membership = mongoose.model('Membership', schema, 'Membership');
const MembershipTemp = mongoose.model('MembershipTemp', schema, 'MembershipTemp');

module.exports = { Membership, MembershipTemp };
