class syncDataIssues {
	constructor(model) {
		this.modelIssues = model.issues.issues;
		this.modelIssuesTemp = model.issues.issuesTemp;
		this.Project = model.Project;
		this.apiIssues = new model.apiIssues();
		this.allProjectID = [];
		this.listProject = [];
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

	async saveMainModelIssues() {
		var issuesTemp = this.modelIssuesTemp;
		var issues = this.modelIssues;
		let total_count = await issuesTemp.countDocuments({ });
		await issues.deleteMany({ });
		let limit = 100;
		let length = total_count/limit;
		let intLenght = parseInt(length);
		if (intLenght < length) {
			intLenght = intLenght + 1;
		}
		for (let i = 0; i < intLenght; i++) {
			let skip = i * limit;
			let dataTemp = await issuesTemp.find({}).skip(skip).limit(limit);
			await issues.insertMany(dataTemp);
		}
		console.log('Insert to Issues :' + total_count + ' documents');
		return 'Save mongodb issues ' + total_count + ' documents';
	}

	getIssuesRedmine(offset = 0) {
		let option = {
			project_id: this.listProject[this.position],
			offset: offset
		};
		// console.log('Issues project ID: ' + option.project_id + ' - offset :' + offset);
		try {
			this.apiIssues.getAllIssues(option, async (data) => {
				if (typeof data === 'object') {
					let listIssues = data.issues.filter((item) => {
						if (this.allProjectID.indexOf(item.project.id) !== -1) {
							return item;
						}
					});
					if (listIssues.length > 0) {
						await this.modelIssuesTemp.insertMany(listIssues).catch((err) => {});
					}
					let offset = data.offset;
					let total_count = data.total_count;
					let nextOffset = offset + 100;
					if (nextOffset >= total_count) {
						console.log('Success Issues Project ID '+option.project_id+' at offset: ' + offset);
						this.position = this.position + 1;
						if (this.listProject.length === this.position) {
							return this.saveMainModelIssues();
						}
						else {
							return this.getIssuesRedmine();
						}
					}
					else {
						return this.getIssuesRedmine(nextOffset);
					}
				}
				else {
					return this.getIssuesRedmine(offset);
				}
			});
		}
		catch(e) {
			return this.getIssuesRedmine(offset);
		}
	}

	async saveIssuesMongo() {
		let allProjectID = await this.getAllProject();
		let listProject = await this.listProjectID();
		this.listProject = listProject;
		this.allProjectID = allProjectID;
		await this.modelIssuesTemp.deleteMany({ });
		this.getIssuesRedmine();
		return "Save Project Issues to mongo success!!!";
	}
}

module.exports = syncDataIssues;

