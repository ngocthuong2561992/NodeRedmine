var moment = require('moment');

class projectDetail {
	constructor (models, projectID) {
		this.issues = models.issues.issues;
		this.timeEntries = models.timeEntries.timeEntries;
		this.Project = models.Project;
		this.User = models.User;
		this.syncManagement = models.syncManagement;
		this.news = models.News.News;
		this.projectID = projectID;
	}

	/**
	* @desc get all data project in mongodb
	* @return array - projects
	*/
	async getDataProject() {
		let query = {
			id: this.projectID
		};
		let data = await this.Project.findOne(query).catch((err) => {
			return null
		});
		return data;
	}

	/**
	* @desc get all parent issue in mongo
	* @return array - issues id
	*/
	// async getAllParentIssues() {
	// 	let query = {
	// 		parent: {
	// 			$exists: true
	// 		}
	// 	};
	// 	let fields = {
	// 		parent:1
	// 	};
	// 	let data = await this.issues.find(query, fields).catch((err) => {
	// 		return [];
	// 	});
	// 	let parent = data.map((item) => {
	// 		return item.parent.id;
	// 	});
	// 	return parent;
	// }

	/**
	* @desc get list issue between start - end
	* @param date start - date
	* @param date end - date
	* @return array - list issues
	*/
	async getIssuesStartEnd(start, end) {
		let query = {
			$and: [
				{
					'project.id': this.projectID
				},
				{
					$or: [
						{
							start_date: {
								$gte: start,
								$lte: end
							}
						},
						{
							due_date: {
								$gte: start,
								$lte: end
							}
						},
						{
							start_date: {
								$lt: start
							},
							due_date: {
								$gt: end
							}
						}
					]
				}
			]
		};
		let sort = {
			start_date: -1,
			due_date: -1,
		};
		let issues = await this.issues.find(query).sort(sort).catch((err) => {
			return [];
		});
		return issues;
	}

	/**
	* @desc get all issue of project in mongodb
	* @return array - issues
	*/
	async getIssuesProject() {
		let query = {
			'project.id': this.projectID,
			estimated_hours: {
				$gt: 0
			}
		};
		let fields = {
			id: 1,
			estimated_hours: 1
		};
		let issues = await this.issues.find(query, fields).catch((err) => {
			return [];
		});
		return issues;
	}

	/**
	* @desc get all time entries of project in mongodb
	* @return array - time entries
	*/
	async getTimeEntriesProject() {
		let query = {
			'project.id': this.projectID
		};
		let fields = {
			issue: 1,
			hours: 1
		}
		let timeEntries = await this.timeEntries.find(query, fields).catch((err) => {
			return [];
		});
		if (timeEntries.length === 0) {
			return 0;
		}
		return timeEntries;
	}

	/**
	* @desc get all News of project in mongodb
	* @return array - list News is filter
	*/
	async getMeetingMinutes() {
		let query = {
			'project.id': this.projectID
		};
		let sort = {
			created_on: -1
		}
		let News = await this.news.find(query).sort(sort).catch((err) => {
			return [];
		});
		let pos = 1;
		let listNews = News.map((item) => {
			let show = (pos === 1)?'show':'';
			pos++
			return {
				id: item.id,
				creator: item.author.name,
				title: item.title,
				created_on: moment(item.created_on).format('YYYY-MM-DD HH:mm'),
				show: show
			};
		});
		return listNews;
	}

	/**
	* @desc get last sync data in redmine
	* @return string - YYYY-MM-DD HH:mm:ss
	*/
	async getLastSyncData() {
		let syncManagement = this.syncManagement;
		let syncData = new syncManagement();
		let lastSync = await syncData.getLastCompleteSync();
		if (lastSync !== '' ) {
			lastSync = moment(lastSync).format('YYYY-MM-DD HH:mm:ss');
		}
		return lastSync;
	}

	/**
	* @desc filter data in mongondb and create object project detail
	* @param date start - date
	* @param date end - date
	* @return obj - object data project detail
	*/
	async createProjectDetail(start, end) {
		let dataProject = await this.getDataProject();
		let lastSync = await this.getLastSyncData();
		if (dataProject === null) {
			return {
				status: 0,
				lastSync: lastSync
			};
		}
		//let listIssueParent = await this.getAllParentIssues();

		let listIssues = await this.getIssuesStartEnd(start, end);
		let allIssuesProject = await this.getIssuesProject();
		let listTimeEntries = await this.getTimeEntriesProject();
		let listNews = await this.getMeetingMinutes();

		let issueFromTo = this.filterIssuesOfProject(listIssues, listTimeEntries);

		//let listIssuesOfProject = this.filterParentNoTimeOnList(issueFromTo.listIssuesOfProject, listIssueParent);
		let listIssuesOfProject = issueFromTo.listIssuesOfProject;

		//let listAllIssuesProject = this.removeParentOnlist(allIssuesProject, listIssueParent);
		//let timeAllProject = this.getTotalTimeProject(listTimeEntries, issueFromTo.totalSpentTime, listAllIssuesProject);
		let timeAllProject = this.getTotalTimeProject(listTimeEntries, issueFromTo.totalSpentTime, allIssuesProject);

		let project_created_on = formatDate(dataProject.created_on);
		let issuesJson = {
			status: 1,
			project_id: dataProject.id,
			project_name: dataProject.name,
			project_created_on: project_created_on,
			total_count: listIssuesOfProject.length,
			total_plan_time: fixedNumber(timeAllProject.totalPlanTime),
			total_real_time: fixedNumber(timeAllProject.totalRealTime),
			total_real_time_from_to: fixedNumber(issueFromTo.totalSpentTime),
			date_from: this.start,
			date_to: this.end,
			class_color: timeAllProject.color,
			lastSync: lastSync,
			issues: listIssuesOfProject,
			listNews: listNews
		};
		return issuesJson;
	}

	/**
	* @desc filter issues spent time not found on listIssues
	* @param array listIssues - list issues
	* @param array parent - list issues parent
	* @return array listIssues - list issues
	*/
	// filterParentNoTimeOnList(listIssues, parent) {
	// 	if (parent.length > 0) {
	// 		let list = listIssues.filter(item => {
	// 			if (parent.indexOf(item.id) === -1) {
	// 				return item;
	// 			}
	// 			else if (item.spent_time !== 0) {
	// 				return item;
	// 			}
	// 		});
	// 		return list;
	// 	}
	// 	return listIssues;
	// }

	/**
	* @desc filter issues spent time not found on listIssues
	* @param array listIssues - list issues
	* @param array parent - list issues parent
	* @return array listIssues - list issues
	*/
	// removeParentOnlist(listIssues, parent) {
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

	/**
	* @desc filter list issues and time entries => list issues in project detail
	* @param array listIssues - list issues
	* @param array listTimeEntries - list time entries
	* @return array listIssues - list issues filter project detail
	*/
	filterIssuesOfProject(listIssues, listTimeEntries) {
		let listIssuesOfProject = [];
		// let totalPlanTime = 0;
		let totalSpentTime = 0;
		let length = listIssues.length;
		for (let i = 0; i < length; i++) {
			let spentTime = 0;
			for (var j = 0; j < listTimeEntries.length; j++) {
				if (listIssues[i].id === listTimeEntries[j].issue.id) {
					spentTime += listTimeEntries[j].hours;
					listTimeEntries.splice(j, 1);
					j = j - 1;
				}
			}
			let estimatedTime = 0;
			let workload = 0;
			if (listIssues[i].estimated_hours) {
				estimatedTime = listIssues[i].estimated_hours;
				workload = findWorkLoad(spentTime, estimatedTime);
			}
			let color = setCorlor(spentTime, estimatedTime);
			let detailIssues = {
				id: listIssues[i].id,
				subject: listIssues[i].subject,
				workload: workload,
				estimated_time: estimatedTime,
				spent_time: fixedNumber(spentTime),
				start_date: formatDate(listIssues[i].start_date),
				due_date: formatDate(listIssues[i].due_date),
				status: listIssues[i].status.name,
				done_ratio: listIssues[i].done_ratio,
				class_color: color
			};
			listIssuesOfProject.push(detailIssues);
			// totalPlanTime += estimatedTime;
			totalSpentTime += spentTime;
		}
		return {
			listIssuesOfProject,
			// totalPlanTime,
			totalSpentTime: totalSpentTime
		};
	}

	/**
	* @desc get total plan time and real time
	* @param array listTimeEntries - list time entries
	* @param array realTimeFromTO - real time in from - to
	* @param array allIssues - all issues in project
	* @return object
	*/
	getTotalTimeProject(listTimeEntries, realTimeFromTO, allIssues) {
		let totalPlanTime = 0;
		let totalRealTime = realTimeFromTO;
		let lengthIssue = allIssues.length;
		for (let i = 0; i < lengthIssue; i++) {
			totalPlanTime += allIssues[i].estimated_hours;
		}
		let lengthTime = listTimeEntries.length;
		for (let i = 0; i < lengthTime; i++) {
			totalRealTime += listTimeEntries[i].hours;
		}
		let color = setCorlor(totalRealTime, totalPlanTime);
		return {
			totalPlanTime: totalPlanTime,
			totalRealTime: totalRealTime,
			color
		};
	}
}

/**
* @desc get total plan time and real time
* @param number spentTime - spent time
* @param number estimatedTime - plan time
* @return string
*/
function setCorlor(spentTime, estimatedTime) {
	var color = '';
	if (spentTime < estimatedTime) {
	  color = 'wl-available';
	}
	else if (spentTime > estimatedTime) {
	  color = 'wl-overload'; 
	}
	else {
	  color = 'wl-normal';
	}
	return color;
}

/**
* @desc find workload with plan time and real time
* @param number spentTime - spent time
* @param number estimatedTime - plan time
* @return number
*/
function findWorkLoad(spentTime, estimatedTime) {
	let workload = (spentTime * 100) / estimatedTime;
	workload = Math.round( workload * 100) / 100;
	return workload;
}

/**
* @desc fix number
* @param number number - ex: 12.3201
* @return number - ex: 12.3
*/
function fixedNumber(number) {
	return Math.round( number * 10 ) / 10;
}

/**
* @desc format date type
* @param date - date ex: 2019-08-12T00:00:00.000+00:00
* @return number - ex: 2019-08-12
*/
function formatDate(date) {
	if (date !== undefined) {
		return moment(date).format('YYYY-MM-DD');
	}
	return '';
}

module.exports = projectDetail;