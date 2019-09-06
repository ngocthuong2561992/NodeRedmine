const _ = require('lodash');
var moment = require('moment');

class workload {
	constructor(models, from, to) {
		this.issues = models.issues.issues;
		this.timeEntries = models.timeEntries.timeEntries;
		this.Project = models.Project;
		this.User = models.User;
		this.holiday = models.holiday;
		this.syncManagement = models.syncManagement;
		this.NonWorking = models.NonWorking;
		this.start = new Date(from);
		this.end = new Date(to);
	}

	/**
	* @desc get all data users in mongodb
	* @return array - users
	*/
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
		return listUser;
	}

	/**
	* @desc get all data project in mongodb
	* @return array - projects
	*/
	async getAllProject() {
		let query = {
			status: {
				$eq: 1 
			} 
		};
		let fields = {
			id: 1,
			name: 1,
			parent:1,
		};
		let sort = {
			name: 1
		}
		let listProject = await this.Project.find(query, fields).sort(sort).catch((err) => {
			return [];
		});
		return listProject;
	}

	/**
	* @desc get time entries of all project in mongodb
	* @return array - time entries
	*/
	async getTimeEntriesAllProject() {
		let query = {};
		let fields = {
			project: 1,
			hours: 1
		}
		let timeEntries = await this.timeEntries.find(query, fields).catch((err) => {
			return [];
		});
		return timeEntries;
	}

	/**
	* @desc get time entries between start - end
	* @return array - time entries
	*/
	async getTimeEntriesStartEnd() {
		let query = {
			spent_on: {
				$gte: this.start,
				$lte: this.end
			}
		};
		let fields = {
			project: 1,
			user: 1,
			hours: 1
		}
		let timeEntries = await this.timeEntries.find(query, fields).catch((err) => {
			return [];
		});
		return timeEntries;
	}

	async getWorkingDay() {
		let query = {
			$or: [
				{
					from: {
						$gte: this.start,
						$lte: this.end
					}
				},
				{
					to: {
						$gte: this.start,
						$lte: this.end
					}
				},
				{
					from: {
						$lt: this.start
					},
					to: {
						$gt: this.end
					}
				}
			]
		};
		let listHoliday = await this.holiday.find(query).catch((err) => {
			return [];
		});
		let offHoliday = 0;
		let length = listHoliday.length;
		if (length > 0) {
			for (let i = 0; i < length; i++) {
				if (listHoliday[i].from.getTime() === listHoliday[i].to.getTime()) {
					let from = moment(listHoliday[i].from);
					let day = from.day();
					if (day !== 0 && day !== 6) {
						offHoliday++;
					}
				}
				else {
					let form = moment(listHoliday[i].from);
					let to = moment(listHoliday[i].to);
					let days = to.diff(form, 'd');
					for (let j = 0; j <= days; j++) {
						let dayFrom = form.clone();
						let nextDate = dayFrom.add(j, 'd');
						let date = new Date(nextDate.format('YYYY-MM-DD'));
						if (date >= this.start && date <= this.end) {
							let day = nextDate.day();
							if (day !== 0 && day !== 6) {
								offHoliday++;
							}
						}
					}
				}
			}
		}
		let workingDay = realWorkingDay(this.start, this.end);
		let dayWorking = workingDay - offHoliday;
		return dayWorking;
	}

	async getNonWorking() {
		let query = {
			status: 'approve'
		};
		let queryDay = {
			day: {
				$gte: this.start,
				$lte: this.end
			}
		};
		let fields = {
			mail: 1,
			time: 1,
			days: 1,
			type: 1,
		}
		let data = await this.NonWorking.find(query).elemMatch('days', queryDay).select(fields);
		return data;
	}

	async getLastSyncData() {
		let syncManagement = this.syncManagement;
		let syncData = new syncManagement();
		let lastSync = await syncData.getLastCompleteSync();
		if (lastSync !== '' ) {
			lastSync = moment(lastSync).format('YYYY-MM-DD HH:mm:ss');
		}
		return lastSync;
	}

	async getAllProjectIssues() {
		let projects = await this.getAllProject();
		let query = {
			estimated_hours: {
				$gt: 0
			}
		};
		let fields = {
			project: 1,
			id: 1,
			start_date: 1,
			due_date: 1,
			parent:1,
			estimated_hours: 1
		};
		let data = await this.issues.find(query, fields).catch((err) => {
			return [];
		});
		// if (data.length === 0) {
		// 	let listProjects = this.filterProjectIssues(projects, []);
		// 	return listProjects;
		// }
		// let dataIssues = this.removeParentOnlist(data);
		let listProjects = this.filterProjectIssues(projects, data);
		return listProjects;
	}

	// removeParentOnlist(listIssues) {
	// 	let parent = [];
	// 	let length = listIssues.length;
	// 	for (let i = 0; i < length; i++) {
	// 		if (listIssues[i].parent.id !== undefined && parent.indexOf(listIssues[i].parent.id) === -1) {
	// 			parent.push(listIssues[i].parent.id);
	// 		}
	// 	}
	// 	if (parent.length > 0) {
	// 		let list = listIssues.filter(item => {
	// 			if (parent.indexOf(item.id) === -1) {
	// 				return item;
	// 			}
	// 		});
	// 		return list;
	// 	}
	// 	return listIssues;
	// }

	filterProjectIssues(projects, listIssues) {
		let listProjects = [];
		let projectLength = projects.length;
		for (let i = 0; i < projectLength; i++) {
			let estimated_hours = 0;
			listIssues = listIssues.filter(item => {
				if (item.project.id === projects[i].id) {
					estimated_hours += item.estimated_hours;
				}
				else {
					return item;
				}
			});
			let objProject = {
				project_id: projects[i].id,
				project_name: projects[i].name,
				estimated_hours: estimated_hours
			};
			if (projects[i].parent.id !== undefined) {
				objProject.parent = projects[i].parent;
			}
			listProjects.push(objProject);
		}
		return listProjects;
	}

	filterNonWorkingUser(listNonWorking, listUsers) {
		let dateFrom = moment(this.start);
		let dateTo = moment(this.end);
		let listUserNonWorking = {};
		let userLength = listUsers.length;
		for (let i = 0; i < userLength; i++ ) {
			let lastName = listUsers[i].lastname.split(' ', 1)[0];
			let firstName = listUsers[i].firstname;
			let mail = lastName.toLowerCase() + '.' + firstName.toLowerCase() + '@gigei.jp';
			let nonWorking = 0;
			for (let j = 0; j < listNonWorking.length; j++) {
				if (listNonWorking[j].mail === mail) {
					let hours = 0;
					if (listNonWorking[j].type === 'late') {
						hours += listNonWorking[j].time;
					}
					else {
						for (let d = 0; d < listNonWorking[j].days.length; d++) {
							let day = moment(listNonWorking[j].days[d].day)
							if (day >= dateFrom && day <= dateTo) {
								hours += 8;
							}
						}
					}
					nonWorking += hours;
					listNonWorking.splice(j, 1);
					j = j - 1;
				}
			}
			listUserNonWorking[listUsers[i].id] = nonWorking;
		}
		return listUserNonWorking;
	}

	filterTimeEntriesOfProject(timeEntries, listProjects) {
		let projects = {};
		let projectLength = listProjects.length;
		for (let i = 0; i < projectLength; i++) {
			projects[listProjects[i].project_id] = 0;
		}
		let timeEntriesLength = timeEntries.length;
		for (let i = 0; i < timeEntriesLength; i++) {
			projects[timeEntries[i].project.id] += timeEntries[i].hours;
		}
		listProjects = listProjects.map(item => {
			item.spent_time = projects[item.project_id];
			return item;
		});
		listProjects = listProjects.filter(item => {
			if (item.estimated_hours !== 0 || item.spent_time !== 0) {
				return item;
			}
		});
		let projectSort = sortProjectAsParent(listProjects);
		return projectSort;
	}

	filterTimeEntriesOfUser(timeEntries, listUsers) {
		let listUserTime = [];
		let length = listUsers.length;
		for (let i = 0; i < length; i++) {
			let listTimeEntries = [];
			timeEntries = timeEntries.filter(item => {
				if (item.user.id === listUsers[i].id) {
					listTimeEntries.push(item);
				}
				else {
					return item;
				}
			});
			let user = {
				user: {
					id: listUsers[i].id,
					name: listUsers[i].lastname + ' ' + listUsers[i].firstname
				},
				timeEntries: listTimeEntries
			};
			listUserTime.push(user);
		}
		return listUserTime;
	}

	getRealTimeProjectOfUser(listUserTime, projectPlanTime, workingDay, nonWorking) {
		let timeEntries = listUserTime.timeEntries;
		var projects = [];
		var sumRealTime = 0;
		let length = projectPlanTime.length;
		for (var i = 0; i < length; i++) {
			var realTime = 0;
			timeEntries = timeEntries.filter(item => {
				if (projectPlanTime[i].project_id === item.project.id) {
					realTime += item.hours;
				}
				else {
					return item;
				}
			});
			var project = {
				"id": projectPlanTime[i].project_id,
				"name": projectPlanTime[i].project_name,
				"real_time": realTime
			};
			sumRealTime += realTime;
			projects.push(project);
		}
		let workingHour = (workingDay * 8) - nonWorking;
		var workload = findWorkLoad(workingHour, sumRealTime);
		var background = setCorlorWorkLoad(workload);
		return {
			"no": 0,
			"id_user": listUserTime.user.id,
			"username": listUserTime.user.name,
			"workload": workload,
			"class_color": background,
			"sum_real_time": sumRealTime,
			"working_hour": workingHour,
			"projects": projects
		};
	}

	getProjectsEffortRealTime(listProjects, listUsersWorkload) {
		var projects = [];
		let length = listProjects.length;
		for (var i = 0; i < length; i++) {
			var realTime = getRealTime(listUsersWorkload, i);
			var classColor = setCorlorRealTime(listProjects[i].spent_time, listProjects[i].estimated_hours);
			var project = {
			"no": i + 5,
			"project_id": listProjects[i].project_id,
			"project_name": listProjects[i].project_name,
			"plan_time": listProjects[i].estimated_hours,
			"real_time": listProjects[i].spent_time,
			"real_time_from_to": realTime,
			"class_color": classColor,
			"filter_name": listProjects[i].filter_name,
			};
			projects.push(project);
		}
		return projects;
	}

	async createWorkload() {
		let listUsers = await this.getAllUser();
		let alltTimeEntries = await this.getTimeEntriesAllProject();
		let timeEntriesStartEnd = await this. getTimeEntriesStartEnd();
		let listProjectsIssues = await this.getAllProjectIssues();
		let workingDay = await this.getWorkingDay();
		let lastSync = await this.getLastSyncData();
		let listNonWorking = await this.getNonWorking();

		let listUserNonWorking = this.filterNonWorkingUser(listNonWorking, listUsers);
		let listProjects = this.filterTimeEntriesOfProject(alltTimeEntries, listProjectsIssues);
		let listUserTime = this.filterTimeEntriesOfUser(timeEntriesStartEnd, listUsers);

		let listUsersWorkload = [];
		let length = listUserTime.length;
		for (let i = 0; i < length; i++ ) {
			let nonWorking = listUserNonWorking[listUserTime[i].user.id];
			let user = this.getRealTimeProjectOfUser(listUserTime[i], listProjects, workingDay, nonWorking);
			user.no = i + 1;
			listUsersWorkload.push(user);
		}
		let listProjectsWorkload = this.getProjectsEffortRealTime(listProjects, listUsersWorkload);
		let objectWorkload = {
			"status": 1,
			"total_count_projects": listProjectsWorkload.length,
			"total_count_users": listUsersWorkload.length,
			"date_from": this.start,
			"date_to": this.end,
			"working_hours": (workingDay * 8),
			"lastSync": lastSync,
			"projects": listProjectsWorkload,
			"users": listUsersWorkload
		};
		return objectWorkload;
	}

	filterWorkload(callback) {
		var workload = this.createWorkload();
		workload.then((data) => {
			if (data.status === 1) {
				let workload = fixNumberInWorkload(data);
				callback(workload);
			}
			else {
				callback(data);
			}
		})
		.catch(err => {
			console.log(err)
		});
	}
}

function setCorlorWorkLoad(workload) {
	var color = '';
	if (workload > 100) {
		color = 'wl-overload';
	}
	else if (workload < 50) {
		color = 'wl-available'; 
	}
	else {
		color = 'wl-normal';
	}
	return color;
}

function findWorkLoad(workingHour, sumRealTime) {
	if (workingHour === 0 || sumRealTime === 0) {
		return 0;
	}
	var workload = sumRealTime / workingHour * 100;
	workload = Math.round( workload * 100) / 100;
	return workload;
}

function getDayOffInStage(startTime, endTime) {
	let days = endTime.diff(startTime, 'd');
	let dayOff = 0;
	for (var i = 0; i<= days; i++) {
		let dayStart = startTime.clone();
		let nextDate = dayStart.add(i, 'd');
		let day = nextDate.day();
		if (day === 0 || day === 6) {
			dayOff++;
		}
	}
	return dayOff;
}

function getDaysInStage(startTime, endTime) {
	let dayIn = endTime.diff(startTime, 'd') + 1;
	return dayIn;
}

function realWorkingDay(from, to) {
	var startTime = moment(from);
	var endTime = moment(to);
	let dayIn = getDaysInStage(startTime, endTime);
	let dayOff = getDayOffInStage(startTime, endTime);
	let dayWorking = dayIn - dayOff;
	return dayWorking;
}

function getRealTime(listUsers, pos) {
	var realTime = 0;
	let length = listUsers.length;
	for (var i = 0; i < length; i++) {
		realTime += listUsers[i].projects[pos].real_time;
	}
	return realTime;
}

function setCorlorRealTime(realTime, planTime) {
	realTime = Number(realTime);
	planTime = Number(planTime);
	var color = '';
	if (realTime === planTime) {
		color = 'wl-normal';
	}
	else if (realTime > planTime) {
		color = 'wl-overload'; 
	}
	else {
		color = 'wl-available';
	}
	return color;
}

function fixNumberInWorkload(workload) {
	workload.projects.map((item) => {
		item.plan_time = fixedNumberTotal(item.plan_time);
		item.real_time = fixedNumberTotal(item.real_time);
		item.real_time_from_to = fixedNumberTotal(item.real_time_from_to);
		return item;
	});
	workload.users.map((row) => {
		row.sum_real_time = fixedNumberTotal(row.sum_real_time);
		row.projects.map((item) => {
			item.real_time = fixedNumberRow(item.real_time);
			return item;
		});
		return row;
	});
	return workload;
}

function fixedNumberTotal(number) {
	return Math.round( number * 10 ) / 10;
}

function fixedNumberRow(number) {
	var n = Math.round( number * 10 ) / 10;
	if (n === 0) {
		n = '';
	}
	return n;
}

function sortProjectAsParent(listProject) {
	let projectIDs = listProject.map(item => {
		return item.project_id;
	});
	let projectLevel = [];
	let projects = [];
	for (let i = 0; i < listProject.length; i++) {
		if (listProject[i].parent === undefined) {
			projects.push(listProject[i]);
			listProject.splice(i, 1);
			i = i - 1;
		}
		else {
			if (projectIDs.indexOf(listProject[i].parent.id) === -1) {
				projects.push(listProject[i]);
				listProject.splice(i, 1);
				i = i - 1;
			}
		}
	}
	projectLevel.push(projects);
	let pos = 0;
	while(listProject.length > 0) {
		let projectParent = projectLevel[pos].map(item => {
			return item.project_id;
		});
		let projectKids = [];
		for (let i = 0; i < listProject.length; i++) {
			if (projectParent.indexOf(listProject[i].parent.id) !== -1) {
				projectKids.push(listProject[i]);
				listProject.splice(i, 1);
				i = i - 1;
			}
		}
		projectLevel.push(projectKids);
		pos++;
	}
	let vt = 0;
	let projectChangeName = projectLevel;
	let length_i = projectChangeName.length;
	for (let i = 0; i < length_i; i++) {
		let length_j = projectChangeName[i].length; 
		for (let j = 0; j < length_j; j++) {
			let obj = {};
			if (projectChangeName[i][j].parent !== undefined) {
				obj.parent = projectChangeName[i][j].parent;
			}
			obj.project_id = projectChangeName[i][j].project_id;
			obj.project_name = projectChangeName[i][j].project_name;
			obj.estimated_hours = projectChangeName[i][j].estimated_hours;
			obj.spent_time = projectChangeName[i][j].spent_time;
			obj.filter_name = namePosition(vt, obj.project_name);
			projectChangeName[i][j] = [obj];
		}
		vt++;
	}

	let listProjectLevel = projectChangeName.reverse();
	let length = (listProjectLevel.length - 1);
	for (let position = 0; position < length; position++) {
		let nextPos = position + 1;

		for (let a = 0; a < listProjectLevel[nextPos].length; a++) {
			let listKids = [];
			let projectID = listProjectLevel[nextPos][a][0].project_id;
			for (let i = 0; i < listProjectLevel[position].length; i++) {
				if (projectID === listProjectLevel[position][i][0].parent.id) {
					listKids = listKids.concat(listProjectLevel[position][i]);
				}
			}
			listProjectLevel[nextPos][a] = listProjectLevel[nextPos][a].concat(listKids);
		}
	}

	let listAllProjectSort = [];
	let length_n = listProjectLevel[length].length;
	for (let i = 0; i < length_n; i++) {
		let projectRemoveParent = listProjectLevel[length][i].map(item => {
			delete item.parent;
			return item;
		});
		listAllProjectSort = listAllProjectSort.concat(projectRemoveParent);
	}
	return listAllProjectSort;
}

function namePosition(pos, name) {
	let string = "";
	for (let i = 0; i < pos ; i++) {
		string = " &#187;" + string;
	}
	if (pos > 0) {
		return string + ' ' + name;
	}
	return name;
}

module.exports = workload;
