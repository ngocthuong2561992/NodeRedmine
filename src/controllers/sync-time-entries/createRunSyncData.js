var moment = require('moment');

const createRunSyncData = ( models ) => async (req, res, next) => {
	let syncManagement = models.syncManagement;
	let syncData = new syncManagement();
	let last = await syncData.createSync();
	res.status(200).send(last);
};

module.exports = createRunSyncData;