class syncDataTimeEntries {
	constructor(model) {
		this.modelTimeEntries = model.timeEntries.timeEntries;
		this.modelTimeEntriesTemp = model.timeEntries.timeEntriesTemp;
		this.apiTimeEntries = new model.apiTimeEntries();
		this.Project = model.Project;
		this.syncManagement = new model.syncManagement();
		this.lastSyncID = '';
		this.listProject = [],
		this.position = 0;
	}

	async getAllProject() {
		let query = {
			status: {
				$eq: 1
			} 
		};
		let listProject = await this.Project.find(query).catch((err) => {
			return [];
		});
		let projectIDs = listProject.map(item => {
			return item.id;
		});
		return projectIDs;
	}

	async listProjectID() {
		let query = {
			status: {
				$eq: 1
			} 
		};
		let listProject = await this.Project.find(query);
		let projectIDs = listProject.map(item => {
			return item.id;
		});
		let projects = [];
		for (let i = 0; i < listProject.length; i++) {
			if (listProject[i].parent === undefined) {
				projects.push(listProject[i].id);
				listProject.splice(i, 1);
				i = i - 1;
			}
			else {
				if (projectIDs.indexOf(listProject[i].parent.id) === -1) {
					projects.push(listProject[i].id);
					listProject.splice(i, 1);
					i = i - 1;
				}
			}
		}
		return projects;
	}

	async saveMainModelTimeEntries() {
		var timeEntriesTemp = this.modelTimeEntriesTemp;
		var timeEntries = this.modelTimeEntries;
		let total_count = await timeEntriesTemp.countDocuments({ });
		await timeEntries.deleteMany({});
		let limit = 100;
		let length = total_count/limit;
		let intLenght = parseInt(length);
		if (intLenght < length) {
			intLenght = intLenght + 1;
		}
		for (let i = 0; i < intLenght; i++) {
			let skip = i * limit;
			let dataTemp = await timeEntriesTemp.find({}).skip(skip).limit(limit);
			await timeEntries.insertMany(dataTemp);
		}
		if (this.lastSyncID !== '') {
			this.syncManagement.completeSync(this.lastSyncID);
		}
		console.log('Insert to timeEntries :' + total_count + ' documents');
		return 'Save mongodb time entries ' + total_count + ' documents';
	}

	getTimeEntriesRedmine(offset = 0) {
		let option = {
			project_id: this.listProject[this.position],
			offset: offset
		};
		// console.log('Time Entries project ID: ' + option.project_id + ' - offset :' + offset);
		try {
			this.apiTimeEntries.getAllProjectTimeEntries(option, async (data) => {
				if (typeof data === 'object') {
					let listTimeEntries = data.time_entries.filter((item) => {
						if (this.allProjectID.indexOf(item.project.id) !== -1) {
							return item;
						}
					});
					if (listTimeEntries.length > 0) {
						await this.modelTimeEntriesTemp.insertMany(listTimeEntries).catch((err) => {});
					}
					let offset = data.offset;
					let total_count = data.total_count;
					let nextOffset = offset + 100;
					if (nextOffset >= total_count) {
						console.log('Success Time Entries Project ID '+option.project_id+' at offset: ' + offset);
						this.position = this.position + 1;
						if (this.listProject.length === this.position) {
							return this.saveMainModelTimeEntries();
						}
						else {
							return this.getTimeEntriesRedmine();
						}
					}
					else {
						return this.getTimeEntriesRedmine(nextOffset);
					}
				}
				else {
					return this.getTimeEntriesRedmine(offset);
				}
			});
		}
		catch(e) {
			return this.getTimeEntriesRedmine(offset);
		}
	}

	async saveTimeEntriesMongo(lastSyncID = '') {
		let allProjectID = await this.getAllProject();
		let listProject = await this.listProjectID();
		this.listProject = listProject;
		this.allProjectID = allProjectID;
		this.lastSyncID = lastSyncID;
		await this.modelTimeEntriesTemp.deleteMany({ });
		this.getTimeEntriesRedmine();
		return "Save Project time entries to mongo success!!!";
	}
}

module.exports = syncDataTimeEntries;