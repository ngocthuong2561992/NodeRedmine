class syncDataMembership {
	constructor(model) {
		this.Membership = model.Membership.Membership;
		this.MembershipTemp = model.Membership.MembershipTemp;
		this.Project = model.Project;
		this.apiMembership = new model.apiMembership();
		this.listProject = [];
		this.position = 0;
	}

	async listProjectID() {
		let query = {
			status: {
				$eq: 1
			}
		};
		let fields = {
			id: 1
		};
		let data = await this.Project.find(query, fields);
		let listProject = data.map((project) => {
			return project.id;
		});
		return listProject;
	}

	async saveMainModelMemberships() {
		let total_count = await this.MembershipTemp.countDocuments({ });
		await this.Membership.deleteMany({ });
		let limit = 100;
		let length = total_count/limit;
		let intLenght = parseInt(length);
		if (intLenght < length) {
			intLenght = intLenght + 1;
		}
		for (let i = 0; i < intLenght; i++) {
			let skip = i * limit;
			let dataTemp = await this.MembershipTemp.find({}).skip(skip).limit(limit);
			await this.Membership.insertMany(dataTemp);
		}
		console.log('Insert to Memberships :' + total_count + ' documents');
		return 'Save mongodb Memberships ' + total_count + ' documents';
	}

	getMembershipRedmine(offset = 0) {
		let option = {
			projectID: this.listProject[this.position],
			offset: offset
		};
		try {
			this.apiMembership.getProjectMembership(option, async (data) => {
				if (typeof data === 'object') {
					await this.MembershipTemp.insertMany(data.memberships);
					let offset = data.offset;
					let total_count = data.total_count;
					let nextOffset = offset + 100;
					if (nextOffset >= total_count) {
						this.position = this.position + 1;
						if (this.listProject.length === this.position) {
							return this.saveMainModelMemberships();
						}
						else {
							return this.getMembershipRedmine();
						}
					}
					else {
						return this.getMembershipRedmine(nextOffset);
					}
				}
				else {
					return this.getMembershipRedmine(offset);
				}
			});
		}
		catch(e) {
			return this.getMembershipRedmine(offset);
		}
	}

	async saveMembershipsMongo() {
		let listProject = await this.listProjectID();
		await this.MembershipTemp.deleteMany({ });
		this.listProject = listProject;
		this.getMembershipRedmine();
		return { length: this.listProject.length };
	}
}

module.exports = syncDataMembership;

