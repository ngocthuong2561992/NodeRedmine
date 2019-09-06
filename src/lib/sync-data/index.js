const { syncData } = require('../../models/sync-data');

class syncManagement {
	constructor() {
		this.syncData = syncData;
	}

	async createSync() {
		let sync = new syncData();
		sync.running = true;
		sync.from = new Date();
		let data = await sync.save();
		return data;
	}

	async findLastSync() {
		let query = {};
		let data = await syncData.findOne(query).sort({ from: -1 });
		return data;
	}

	completeSync(id) {
		let data = {running: false, to: new Date()};
		syncData.updateOne({_id: id}, data, (err, product) => {
			if (err) throw err;
		});
	}

	async updateLastSync() {
		let last = await syncData.findOne({}).sort({ from: -1 });
		let data = {running: false, to: new Date()};
		syncData.updateOne({_id: last._id}, data, (err, product) => {
			if (err) throw err;
			console.log(product);
		});
	}

	async getLastCompleteSync() {
		let query = {};
		let data = await syncData.find(query).sort({ from: -1 });
		let lastSync = '';
		for (let i = 0; i < data.length; i++) {
			if (data[i].to) {
				lastSync = data[i].to;
				break;
			}
		}
		return lastSync;
	}
}

module.exports = syncManagement;