const _ = require('lodash');

const getApiIssues = ({ apiIssues, issues }, { config }) => async (req, res, next) => {
	var _apiIssues = new apiIssues();
	var issuesTemp = issues.issuesTemp;
	let option = {
		offset: 0
	};
	await issuesTemp.deleteMany({ });
	_apiIssues.getAllIssues(option, function(data) {
		let dataOutput = {
			total_count: data.total_count  
		};
		res.status(200).send(dataOutput);
	});
};

const saveIssues = (models, { config }) => async (req, res, next) => {
	let issuesTemp = models.issues.issuesTemp;
	let issues = models.issues.issues;
	await issues.deleteMany({ });
	let total_count = await issuesTemp.countDocuments({ });
	let limit = 100;
	let length = total_count/limit;
	let intLenght = parseInt(length);
	if (intLenght < length) {
		intLenght = intLenght + 1;
	}
	for (let i = 0; i < intLenght; i++) {
		let skip = i * limit;
		let dataTemp = await issuesTemp.find({}).skip(skip).limit(limit);
		await issues.insertMany(dataTemp);
	}
	res.status(200).send('Save mongo Issues success!!!');
};

module.exports= { getApiIssues, saveIssues };
