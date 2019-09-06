const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  id: {
    type: Number,
    required: [true],
  },
  name: {
    type: String,
    required: [true],
  },
  identifier: {
    type: String,
    required: [true],
  },
  parent: {
    id : Number,
    name : String
  },
  status: {
    type: Number,
    required: [true],
  },
  created_on: {
    type: Date,
    required: [true],
  },
  updated_on: {
    type: Date,
    required: [true],
  }
});

module.exports = { schema };
