const _ = require('lodash');

const getApiMembership = ({ apiMembership }) => async (req, res, next) => {
	var _apiMembership = new apiMembership();
	let option = {
		projectID: req.query.project_id
	};
	_apiMembership.getProjectMembership(option, function(data) {
		res.status(200).send(data);
	});
};

module.exports= { getApiMembership };
