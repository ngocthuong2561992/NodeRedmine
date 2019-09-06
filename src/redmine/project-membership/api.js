const {apiRedmine} = require('../api');
const config = require('../../../config');
const http = require("https");

class apiMembership {
	constructor () {
		this._apiRedmine = new apiRedmine();
	}
	
	getProjectMembership(option, callback) {
		let offset = (option.offset)?('&offset=' + option.offset):'';
		let projectID = option.projectID;
		let url = 'projects/'+ projectID +'/memberships.json?limit=100' + offset;
		this._apiRedmine.get(url, callback);
	}

}


module.exports = { apiMembership };