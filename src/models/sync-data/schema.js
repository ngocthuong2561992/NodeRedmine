const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
	running: Boolean,
	from: Date,
	to: Date
});

module.exports = { schema };
