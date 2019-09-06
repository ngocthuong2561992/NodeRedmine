const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
    id: Number,
    project: {
        id: Number,
        name: String
    },
    author: {
        id: Number,
        name: String
    },
    title: String,
    summary: String,
    description: String,
    created_on: Date
});

module.exports = { schema };
