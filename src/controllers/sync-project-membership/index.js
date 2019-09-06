const express = require('express');
const { syncMembership } = require('../../lib/sync-Redmine');

var syncDataMembership = (models) => {
	let router = express.Router();

	router.get('/syncDataMembership', async (req, res) => {
		let syncData = new syncMembership(models);
		let sync = await syncData.saveMembershipsMongo();
		res.status(200).send(sync);
	});

	return router;
};

module.exports = syncDataMembership;
