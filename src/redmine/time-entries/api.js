const {apiRedmine} = require('../api');

class apiTimeEntries {
	constructor () {
		this._apiRedmine = new apiRedmine();
	}

	getAllTimeEntries(option, callback) {
		let form = '&from=' + option.from;
		let to = '&to=' + option.to;
		let offset = '&offset=' + option.offset;
		let projectID = (option.project_id)?('&project_id=' + option.project_id):'';
		let url = 'time_entries.json?limit=100' + form + to + offset + projectID;
		this._apiRedmine.get(url, callback);
	}

	getAllProjectTimeEntries(option, callback) {
		let offset = '&offset=' + option.offset;
		let projectID = (option.project_id)?('&project_id=' + option.project_id):'';
		let url = 'time_entries.json?limit=100' + offset + projectID;
		this._apiRedmine.get(url, callback);
	}
}


module.exports = { apiTimeEntries };