const {apiRedmine} = require('../api');
const config = require('../../../config');
const http = require("https");

class apiNew {
	constructor () {
		this._apiRedmine = new apiRedmine();
		this.options = this._apiRedmine.options;
	}
	
	getNewJson(option, callback) {
		let offset = (option.offset)?('&offset=' + option.offset):'';
		let projectID = (option.projectID)?('&project_id=' + option.projectID):'';
		let url = 'news.json?limit=100' + projectID + offset;
		this._apiRedmine.get(url, callback);
	}

	getNewAtomAll(callback) {
		let url = 'news.atom';
		this.options.path = '/' + config.redmine_folder + '/' + url;
		this.options.headers["Content-Type"] = 'text/plain';
		http.request(this.options, function (res) {
			res.setEncoding('utf8');
			let rawData = '';
			res.on('data', (chunk) => { 
				rawData += chunk; 
			});

			res.on('end', () => {
				callback(rawData);
			});
		}).end();
	}

	getNewAtomProject(projectID ,callback) {
		let url = 'projects/'+projectID+'/news.atom';
		this.options.path = '/' + config.redmine_folder + '/' + url;
		this.options.headers["Content-Type"] = 'text/plain';
		http.request(this.options, function (res) {
			res.setEncoding('utf8');
			let rawData = '';
			res.on('data', (chunk) => { 
				rawData += chunk; 
			});

			res.on('end', () => {
				callback(rawData);
			});
		}).end();
	}
}


module.exports = { apiNew };