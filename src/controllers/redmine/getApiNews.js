const _ = require('lodash');

const getApiNew = (models) => async (req, res, next) => {
	let apiNew = models.apiNew;
	var _apiNew = new apiNew();
	let type = req.params.type;
	if (type === 'json') {
		if (req.query.project_id) {
			let option = {
				offset: 0,
				projectID: req.query.project_id
			};
			_apiNew.getNewJson(option, (data) => {
				res.status(200).send(data);
			});
		}
		else {
			_apiNew.getNewJson({} ,(data) => {
				res.status(200).send(data);
			});
		}
	}
	else if (type === 'atom') {
		if (req.query.project_id) {
			let projectID = req.query.project_id;
			_apiNew.getNewAtomProject(projectID, (data) => {
				res.status(200).send(data);
			});
		}
		else {
			_apiNew.getNewAtomAll((data) => {
				res.status(200).send(data);
			});
		}
	}
	else {
		res.status(404).render('404', {
			layout: false
		});
	}
};

module.exports= { getApiNew };