const express = require('express');
const { syncNews } = require('../../lib/sync-Redmine');

var syncDataNews = (models) => {
	let router = express.Router();

	router.get('/syncDataNews', async (req, res) => {
		let syncData = new syncNews(models);
		let sync = await syncData.saveNewsMongo();
		res.status(200).send(sync);
	});

	return router;
};

module.exports = syncDataNews;
