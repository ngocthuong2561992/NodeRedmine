const _ = require('lodash');

const getApiTimeEntries = ({ apiTimeEntries, timeEntries }) => async (req, res, next) => {
	var _apiTimeEntries = new apiTimeEntries();
	var currentDate = getCurrentDate();
	var option = {
		from: '2013-01-01',
		to: currentDate,
		offset: 0
	};
	var timeEntriesTemp = timeEntries.timeEntriesTemp;
	await timeEntriesTemp.deleteMany({ });
	_apiTimeEntries.getAllTimeEntries(option, function(data) {
		let dataOutput = {
			total_count: data.total_count  
		};
		res.status(200).send(dataOutput);
	});
};

const saveTimeEntries = (models) => async (req, res, next) => {
	let timeEntriesTemp = models.timeEntries.timeEntriesTemp;
	let timeEntries = models.timeEntries.timeEntries;
	await timeEntries.deleteMany({});
	let total_count = await timeEntriesTemp.countDocuments({ });
	let limit = 100;
	let length = total_count/limit;
	let intLenght = parseInt(length);
	if (intLenght < length) {
		intLenght = intLenght + 1;
	}
	for (let i = 0; i < intLenght; i++) {
		let skip = i * limit;
		let dataTemp = await timeEntriesTemp.find({}).skip(skip).limit(limit);
		await timeEntries.insertMany(dataTemp);
	}
	let syncDataID = req.query.syncID;
	let syncManagement = models.syncManagement;
	let syncData = new syncManagement();
	syncData.completeSync(syncDataID);
	res.status(200).send('Save mongo Time Entries success!!!');
};

function getCurrentDate() {
	var date = new Date();
	var year = date.getFullYear();
	var month = ((date.getMonth() + 1) < 10)?('0' + (date.getMonth() + 1)):(date.getMonth() + 1);
	var day = (date.getDate() < 10)?('0' + date.getDate()):date.getDate();
	var currentDate = year + '-' + month + '-' + day;
	return currentDate;
}

module.exports= { getApiTimeEntries, saveTimeEntries };
