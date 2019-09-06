const {apiRedmine} = require('../api');

const _apiRedmine = new apiRedmine();

class apiProject {
	constructor () {
		this._apiRedmine = new apiRedmine();
  	}
	getAll(limit,offset,callback) {
		this._apiRedmine.get('projects.json?is_public=1&limit='+ limit +'&offset=' + offset, callback);
	}

	getTimeEntries(l,year,offset,callback) {
		let limit = (!l)?"&limit=100000":"&limit=" + l;
		let from = "?from=" + year + "-01-01";
		let to =  "&to=" + year + "-12-31";
		let url = 'time_entries.json'+ from + to + limit + "&offset=" + offset;
		console.log(url);
		this._apiRedmine.get(url, callback);
	}

	getUsers(limit,offset,callback) {
		this._apiRedmine.get('users.json?limit=' + limit + '&offset=' + offset, callback);
	}

	getIssues(limit,offset,callback) {
		this._apiRedmine.get('issues.json?offset=' + offset + '&limit=' + limit, callback);
	}

	getProjects(option, callback) {
		let limit = (!option.limit)?"?limit=100":"?limit=" + option.limit;
		let offset = (!option.offset)?"":"&offset=" + option.offset;
		let is_public = (!option.is_public)?"":"&is_public=" + option.is_public;
		let url = 'projects.json' + limit + offset + is_public;
		this._apiRedmine.get(url, callback);
	}

	getProjectNews(projectsID,callback) {
		let url = 'projects/'+projectsID+'/news.json';
		this._apiRedmine.get(url, callback);
	}
}


module.exports = { apiProject };
