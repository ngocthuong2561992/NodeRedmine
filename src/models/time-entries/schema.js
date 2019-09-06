const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  id: Number,
  project : {
    id: Number,
    name: String
  },
  issue: {
    id: Number
  },
  user: {
    id: Number,
    name: String
  },
  activity: {
    id: Number,
    name: String
  },
  hours: Number,
  comments: String,
  spent_on: Date,
  created_on: Date,
  updated_on: Date
});

module.exports = { schema };