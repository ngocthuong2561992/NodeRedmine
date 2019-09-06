const mongoose = require('mongoose');
const { schema } = require('./schema');
const News = mongoose.model('News', schema, 'News');
const NewsTemp = mongoose.model('NewsTemp', schema, 'NewsTemp');

module.exports = { News, NewsTemp };
