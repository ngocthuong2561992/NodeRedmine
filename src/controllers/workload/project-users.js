class filterUser {
	constructor (models) {
		this.Membership = models.Membership.Membership;
		this.User = models.User;
	}

	async getAllUser() {
		let query = {};
		let data = await this.User.find(query).catch((err) => {
			return [];
		});
		let listUser = data.filter((user) => {
			if (user.mail.indexOf('@rakumo.vn') !== -1 || user.mail.indexOf('@aoi-sys.vn') !== -1) {
				if (user.login !== 'admin' && user.login !== 'asv-recruit') {
					return user;
				}
			}
		});
		listUser = listUser.map((item) => {
			return item.id;
		});
		return listUser;
	}

	async getMembership() {
		let query = {};
		let fields = {
			project: 1,
			user: 1
		};
		let data = await this.Membership.find(query, fields).catch((err) => {
			return [];
		});
		return data;
	}

	async filterProjectUsers(projectIDs) {
		if (projectIDs.length === 0) {
			return [];
		}
		let listProject = projectIDs.map((item) => {
			return Number(item);
		});
		let listUser = await this.getAllUser();
		let listMember = await this.getMembership();
		let listMembership = listMember.filter((item) => {
			if (listProject.indexOf(item.project.id) !== -1) {
				return item;
			}
		});
		let memberProject = [];
		for (let i = 0; i < listMembership.length; i++) {
			if (listUser.indexOf(listMembership[i].user.id) !== -1 && memberProject.indexOf(listMembership[i].user.id) === -1) {
				memberProject.push(listMembership[i].user.id);
			}
		}
		return memberProject;
	}
}
module.exports = filterUser;