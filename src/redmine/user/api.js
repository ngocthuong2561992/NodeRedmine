const {apiRedmine} = require('../api');

const _apiRedmine = new apiRedmine();

class apiUser {
	constructor () {
		this._apiRedmine = new apiRedmine();
  	}
	getAll(callback) {
		this._apiRedmine.get('users.json', callback);
	}

	getUsers(option, callback) {
		let limit = (!option.limit)?"?limit=100":"?limit=" + option.limit;
		let offset = (!option.offset)?"":"&offset=" + option.offset;
		let group_id = (!option.group_id)?"":"&group_id=" + option.group_id;
		let status = (!option.status)?"":"&status=" + option.status;
		let url = 'users.json' + limit + offset + group_id + status;
		this._apiRedmine.get(url, callback);
	}
}


module.exports = { apiUser };