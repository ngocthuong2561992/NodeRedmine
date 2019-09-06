const _ = require('lodash');

const getApiTimeEntries = ({ apiTimeEntries }, { config }) => async (req, res, next) => {
	var _apiTimeEntries = new apiTimeEntries();
	let option = {
		from: req.query.from,
		to: req.query.to,
		offset: req.query.offset,
		project_id: req.query.project_id
	};
	_apiTimeEntries.getAllTimeEntries(option, function(data) {
		let dataOutput = JSON.stringify(data);
		let count = 0;
		data.time_entries.map((item) => {
			count += item.hours;
			return item;
		});
		console.log(count)
		res.status(200).send(dataOutput);
	});
};

module.exports= { getApiTimeEntries };
