const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  id: { type: Number },
  login: { type: String },
  firstname: { type: String },
  lastname: { type: String },
  mail: { type: String },
  created_on: { type: Date },
  last_login_on: { type: Date }
      
});

module.exports = { schema };
