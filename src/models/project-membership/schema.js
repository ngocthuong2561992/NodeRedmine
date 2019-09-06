const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
    id: Number,
    project: {
        id: Number,
        name: String
    },
    user: {
        id: Number,
        name: String
    },
    roles: [
        {
            id: Number,
            name: String
        }
    ]
});

module.exports = { schema };
