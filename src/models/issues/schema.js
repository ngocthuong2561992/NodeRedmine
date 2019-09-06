const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
	id: Number,
	project: {
		id: Number,
		name: String
	},
	tracker: {
		id: Number,
		name: String
	},
	status: {
		id: Number,
		name: String
	},
	priority: {
		id: Number,
		name: String
	},
	author: {
		id: Number,
		name: String
	},
	assigned_to: {
		id: Number,
		name: String
	},
	parent: {
		id: Number
	},
	subject: String,
	description: String,
	start_date: Date,
	due_date: Date,
	done_ratio: Number,
	is_private: Boolean,
	estimated_hours: Number,
	created_on: Date,
	updated_on: Date
});

module.exports = { schema };