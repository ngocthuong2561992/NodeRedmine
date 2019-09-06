const express = require('express');
const getTimeEntriesAndSave = require('./ajaxTimeEntries');
const createRunSyncData = require('./createRunSyncData');
const { getApiTimeEntries, saveTimeEntries } = require('./deleteAndSaveTimeEntries');

var syncTimeEntries = (models, config) => {
	let router = express.Router();

	router.get('/timeEntries', getTimeEntriesAndSave(models), getTimeEntriesAndSave(models), getTimeEntriesAndSave(models), (req, res) => {
		res.status(200).send('save fail 3: ' + req.query.offset);
	});

	router.get('/getApiTimeEntries', getApiTimeEntries(models));

	router.get('/saveMongoTimeEntries', saveTimeEntries(models));

	router.get('/createRunSyncData', createRunSyncData(models));

	return router;
};

module.exports = syncTimeEntries;
