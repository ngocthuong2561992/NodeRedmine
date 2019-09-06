const express = require('express');
const getIssuesAndSave = require('./ajaxIssues');
const { getApiIssues, saveIssues } = require('./deleteAndSaveIssues');

var syncIssues = (models, config) => {
	let router = express.Router();

	router.get('/issues', getIssuesAndSave(models, config), getIssuesAndSave(models, config), getIssuesAndSave(models, config), (req, res) => {
		res.status(200).send('save fail 3: ' + req.query.offset);
	});

	router.get('/getApiIssues', getApiIssues(models, { config }));

	router.get('/saveMongoIssues', saveIssues(models, { config }));

	return router;
};

module.exports = syncIssues;
