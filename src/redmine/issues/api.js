const {apiRedmine} = require('../api');

class apiIssues {
	constructor () {
		this._apiRedmine = new apiRedmine();
	}

	getAllIssues(option, callback) {
		let offset = '&offset=' + option.offset;
		let projectID = (option.project_id)?('&project_id=' + option.project_id):'';
		let url = 'issues.json?limit=100&status_id=*' + offset + projectID ;
		this._apiRedmine.get(url, callback);
	}

	getIssuesJournals(option, callback) {
		let issuesID = option.issuesID;
		let url = 'issues/' + issuesID + '.json?include=journals';
		this._apiRedmine.get(url, callback);
	}
}


module.exports = { apiIssues };