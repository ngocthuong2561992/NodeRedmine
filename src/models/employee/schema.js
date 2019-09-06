const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  name: { type: String },
  gsuit: { type: String },
  role: { type: String }
});

module.exports = { schema };
