const _ = require('lodash');

const getApiIssues = ({ apiIssues }, { config }) => async (req, res, next) => {
	var _apiIssues= new apiIssues();
	let option = {
		offset: req.query.offset,
		project_id: req.query.project_id
	};
	_apiIssues.getAllIssues(option, function(data) {
		res.status(200).send(data);
	});
};

module.exports= { getApiIssues };
