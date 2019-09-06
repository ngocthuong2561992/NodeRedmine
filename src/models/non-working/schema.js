const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
	name: String,
	mail: String,
	type: String,
	team: String,
	to: [{
		mail: String
	}],
	cc: [{
		mail: String
	}],
	subject: String,
	reason: String,
	status: String,
	time: Number,
	token: {
		time: Date,
		id: String
	},
	days: [{
		day: Date
	}],
	created: Date,
	updated: Date
});

module.exports = { schema };
