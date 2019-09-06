const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
	name: String,
	member: [{
		mail: String,
		role: String
	}],
});

module.exports = { schema };
