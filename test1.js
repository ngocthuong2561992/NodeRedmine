var { apiTimeEntries } = require('./src/redmine/time-entries');
var { apiProject } = require('./src/redmine/project');

const mongosee = require('mongoose');

const { MongoManager } = require('./src/mongo');
const config = require('./config');
const mongoManager = new MongoManager(config);
var mongoConnect = mongoManager.connect();

var modelTime = require('./src/models/time-entries');
var issues = require('./src/models/issues');
var { holiday } = require('./src/models/holiday');
const { Project } = require('./src/models/Project');

var moment = require('moment');

const NonWorking = require('./src/models/non-working');

// const mongoose = require('mongoose');
// const timeEnS = mongoose.model('timeEntriesTemp');

function getRedmineTimeEntries(option) {
	return new Promise((resolve, reject) => {
		var _apiTimeEntries = new apiTimeEntries();
		_apiTimeEntries.getAllTimeEntries(option, function(data) {
			var modelTi = modelTime.timeEntriesTemp;
			modelTi.insertMany(data.time_entries, (err, doc) => {
				if (err) {
					console.log('Error during record insertion : ' + err);
				}
			});
		});
	});
}

function saveTimeEntries() {
	var option = {
		from: '2019-05-01',
		 to: '2019-05-31',
		 offset: 0
	}
	var timeEs = getRedmineTimeEntries(option);
	timeEs.then((data) => {
		let total = data.total_count;
		console.log(total);
	}).catch((err) => console.log(err));
}

function deleteMany1() {
	var modelTi = modelTime.timeEntriesTemp;
	modelTi.deleteMany({ }, function(err, obj) {
		if (err) throw err;
		console.log(obj.n + " document(s) deleted");
	});
}

function rename() {
	mongoConnect.then(() => {
		console.log('connected');
	  
		// Access the underlying database object provided by the MongoDB driver.
		let dbs = mongosee.connection.db;
	  
		// Rename the `test` collection to `foobar`
		return dbs.collection('fdfsdfdsfs').rename('Project');
	  }).then(() => {
		console.log('rename successful');
	  }).catch(e => {
		console.log('rename failed:', e.message);
	  }).then(() => {
		console.log('disconnecting');
		mongosee.disconnect();
	  });
	
}

function droptb() {
	mongoConnect.then(() => {
		console.log('connected');
	  
		// Access the underlying database object provided by the MongoDB driver.
		let dbs = mongosee.connection.db;
	  
		// Rename the `test` collection to `foobar`
		// return dbs.collection('timeentriestemps').drop();
		let count = dbs.collection('timeentriestemps').countDocuments();
		return count;
	  }).then((count) => {
		console.log(count);
		console.log('drop successful');
	  }).catch(e => {
		console.log('drop failed:', e.message);
	  }).then(() => {
		console.log('disconnecting');
		mongosee.disconnect();
	  });
	
}

function copytoMain() {
	var timeEntriesTemp = modelTime.timeEntriesTemp;
	var timeEntries = modelTime.timeEntries;
	timeEntriesTemp.find({}, function(err, doc) {
		if (err) {
			console.log(err);
		}
		else {
			timeEntries.insertMany(doc, (err, data) => {
				if (err) {
					console.log('Error during record insertion : ' + err);
				}
				else {
					console.log(data.length);
				}
			});
		}
	})
}

function createCollection() {
	Project.create({id: 114, name: 'caigido'}, function(err, doc) {
		console.log(doc);
	})
}

function findProject() {
	Project.find({}, function(err, doc) {
		console.log(doc);
	})
}

async function insertProject() {
	for (var i= 0; i< 10; i++) {
		var projects = await Project.insertMany([{id: i, name: 'dadsadsadas'}]);
	}
}

function testDate() {
	let date = new Date();
	let year = date.getFullYear();
	let month = ((date.getMonth() + 1) < 10)?('0' + (date.getMonth() + 1)):(date.getMonth() + 1);
	let day = (date.getDate() < 10)?('0' + date.getDate()):date.getDate();
	var newDate = year + '-' + month + '-' + day;
	console.log(newDate)
}

function testPromiseAll() {
	const userIds = [1, 2, 3, 4]

	Promise.all(userIds.map(api.getUser))
  .then(function(arrayOfResults) {
	  console.log(arrayOfResults);
    const [user1, user2, user3, user4] = arrayOfResults
  })
}

class syncDataTimeEntries {
	constructor(model, config) {
		this.modelTimeEntries = model.modelTime.timeEntries;
		this.modelTimeEntriesTemp = model.modelTime.timeEntriesTemp;
		this.apiTimeEntries = model.apiTimeEntries;
		let date = new Date();
		let year = date.getFullYear();
		let month = ((date.getMonth() + 1) < 10)?('0' + (date.getMonth() + 1)):(date.getMonth() + 1);
		let day = (date.getDate() < 10)?('0' + date.getDate()):date.getDate();
		let currentDate = year + '-' + month + '-' + day;
		this.option = {
			from: '2013-01-01',
			to: currentDate,
			offset: 0
		};
	}

	saveMainModelTimeEntries() {
		var timeEntriesTemp = this.modelTimeEntriesTemp;
		var timeEntries = this.modelTimeEntries;
		timeEntriesTemp.find({}, function(err, data) {
			if (err) {
				console.log(err);
			}
			else {
				timeEntries.deleteMany({ }, function(err, obj) {
					timeEntries.insertMany(data, (err, doc) => {
						if (err) {
							console.log('Error during record insertion : ' + err);
						}
						else {
							console.log('copy ' + doc.length + ' documents');
						}
					});
				});
			}
		});
	}

	getTimeEntriesRedmine(_option) {
		console.log(this.option.offset);
		let apiTimeEntries = this.apiTimeEntries;
		let _apiTimeEntries = new apiTimeEntries();
		try {
			_apiTimeEntries.getAllTimeEntries(_option, (data) => {
				if (typeof data === 'object') {
					this.modelTimeEntriesTemp.insertMany(data.time_entries, (err, doc) => {
						if (err) {
							return this.getTimeEntriesRedmine(_option);
						}
						else {
							let offset = data.offset;
							let total_count = data.total_count;
							let nextOffset = offset + 100;
							if (nextOffset >= total_count) {
								console.log('Success at offset: ' + offset);
								return this.saveMainModelTimeEntries();
							}
							else {
								let nextOption = this.option;
								nextOption.offset = nextOffset;
								return this.getTimeEntriesRedmine(nextOption);
							}
						}
					});
				}
				else {
					return this.getTimeEntriesRedmine(_option);
				}
			});
		}
		catch(e) {
			return this.getTimeEntriesRedmine(_option);
		}
	}

	deleteDocCollectionTemp(callback) {
		this.modelTimeEntriesTemp.deleteMany({ }, function(err, obj) {
			return callback();
		});
	}

	saveTimeEntriesMongo() {
		this.deleteDocCollectionTemp(() => {
			this.getTimeEntriesRedmine(this.option);
		});
	}
}

function tessssssss() {
	var models = {apiTimeEntries, modelTime};
	var ssss = new syncDataTimeEntries(models, config);
	ssss.saveMainModelTimeEntries();
}

// async function getSyncDataTime() {
// 	const models = { Project, modelTime, apiTimeEntries };
// 	var Syndata = new syncDataTimeEntries(models, config);
// 	var total = 40000;
	
// 		let offset = 100;
// 		let length = total/offset;
// 		let intLenght = parseInt(length);
// 		if (intLenght < length) {
// 			intLenght = intLenght + 1;
// 		}
// 		console.log(intLenght);
// 		for (let i = 0; i < intLenght; i++) {
// 			console.log('i ' + i);
// 			let _option = Syndata.option;
// 			_option.offset = 100 * i;
// 			var getTimeE = await Syndata.getTimeEntriesRedmine(_option);
// 		}
// }

// getSyncDataTime();

//testPromiseAll();
// saveTimeEntries();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class workload {
	constructor(models, from, to) {
		this.issues = models.issues.issues;
		this.timeEntries = models.modelTime.timeEntries;
		this.start = new Date(from);
		this.end = new Date(to);
	}

	async getIssuesStartEnd() {
		let query = {
			$or: [
				{
					start_date: {
						$gte: this.start,
						$lte: this.end
					}
				},
				{
					due_date: {
						$gte: this.start,
						$lte: this.end
					}
				},
				{
					start_date: {
						$lt: this.start
					},
					due_date: {
						$gt: this.end
					}
				}
			]
		}
		let data = await this.issues.find(query);
		let dataIssues = data.filter(item => {
			if (item.estimated_hours) {
				return item;
			}
		});
		let projects = [];
		let listIssues = dataIssues.map((item) => {
			if (projects.indexOf(item.project.name) === -1) {
				projects.push(item.project.name);
			}
			var estimated_hours = item.estimated_hours;
			if (item.start_date && item.start_date < this.start) {
				let dayStart_Due = ((item.due_date.getTime() - item.start_date.getTime()) / 1000/60/60/24) + 1;
				let dayDue_start = ((item.due_date.getTime() - this.start.getTime()) / 1000/60/60/24) + 1;
				estimated_hours = estimated_hours * dayDue_start / dayStart_Due;
			}
			if (item.due_date && item.due_date > this.end) {
				let dayStart_End = ((this.end.getTime() - item.start_date.getTime()) / 1000/60/60/24) + 1;
				let dayStart_Due = ((item.due_date.getTime() - item.start_date.getTime()) / 1000/60/60/24) + 1;
				estimated_hours = estimated_hours * dayStart_End / dayStart_Due;
			}
			return {
				project: item.project,
				estimated_hours: estimated_hours
			};
		});
		let listProjects = [];
		for (let i = 0; i < projects.length; i++) {
			let project = projects[i];
			let estimated_hours = 0;
			let projectID = 0;
			for (let j = 0; j < listIssues.length; j++) {
				if (listIssues[j].project.name === project) {
					estimated_hours += listIssues[j].estimated_hours;
					projectID = listIssues[j].project.id;
					listIssues.splice(j, 1);
					j = j - 1;
				}
			}
			let objProject = {
				project_id: projectID,
				project_name: project,
				estimated_hours: estimated_hours
			};
			listProjects.push(objProject);
		}
		return listProjects;
	}

	async getTimeEntriesStartEnd(projectsIssues) {
		console.log(projectsIssues);
		let query = {
			spent_on: {
				$gte: this.start,
				$lte: this.end
			}
		};
		let data = await this.timeEntries.find(query);
		console.log(data);
		let projects = [];
		let users = [];
		for (let i = 0; i < data.length; i++) {
			projects.push(data[i].project)
			users.push(data[i].user);
		}
		let listProjects = filterListIDName(projects);
		let listUsers = filterListIDName(users);
		let listProjectsIssues = filterAllProject(listProjects, projectsIssues);

		var listUsersWorkload = [];
		for (let i = 0; i < listUsers.length; i++ ) {
			let user = this.getRealTimeProjectOfUser(listUsers[i], listProjectsIssues, data);
			listUsersWorkload.push(user);
		}
		var listProjectsWorkload = this.getProjectsEffortRealTime(listProjectsIssues, listUsersWorkload);
		let objectWorkload = {
			"status": 1,
			"total_count_projects": listProjectsWorkload.length,
			"total_count_users": listUsersWorkload.length,
			"date_from": this.from,
			"date_to": this.to, 
			"projects": listProjectsWorkload,
			"users": listUsersWorkload
		  };
		return objectWorkload;
	}

	getRealTimeProjectOfUser(user, projectPlanTime, timeEntries) {
		var projects = [];
		var sumRealTime = 0;
		for (var i = 0; i < projectPlanTime.length; i++) {
			var realTime = 0;
			for (var j = 0; j < timeEntries.length; j++) {
				if (projectPlanTime[i].project_id === timeEntries[j].project.id) {
					realTime += timeEntries[j].hours;
					timeEntries.splice(j, 1);
					j = j - 1;
				}
			}
			var project = {
			"id": projectPlanTime[i].project_id,
			"name": projectPlanTime[i].project_name,
			"real_time": realTime
			};
			sumRealTime += realTime;
			projects.push(project);
		}
		var workload = findWorkLoad(this.start, this.end, sumRealTime);
		var background = setCorlorWorkLoad(workload);
		return {
			"id_user": user.id,
			"username": user.name,
			"mail": user.name + "@rakumo.vn",
			"workload": workload,
			"class_color": background,
			"projects": projects
		};
	}

	getProjectsEffortRealTime(listProjectsIssues, listUsersWorkload) {
		var projects = [];
		for (var i = 0; i < listProjectsIssues.length; i++) {
		  var realTime = getRealTime(listUsersWorkload, i);
		  var classColor = setCorlorRealTime(realTime, listProjectsIssues[i].estimated_hours);
		  var project = {
			"project_id": listProjectsIssues[i].project_id,
			"project_name": listProjectsIssues[i].project_name,
			"plan_time": listProjectsIssues[i].estimated_hours,
			"real_time": realTime,
			"class_color": classColor
		  };
		  projects.push(project);
		}
		return projects;
	}

	filterWorkload() {
		var listProjectIssues = this.getIssuesStartEnd();
		listProjectIssues.then((projectsIssues) => {
			let workload = this.getTimeEntriesStartEnd(projectsIssues);
			return workload;
		})
		.then(data => {
			// console.log(data);
		})
		.catch(err => {
			console.log(err)
		});
	}
}

function filterListIDName(list) {
	var listIDName = [list[0]];
	for (let i = 0; i < list.length; i++ ) {
		let check = 0;
		for (let j = 0; j < listIDName.length; j++ ) {
			if (list[i].id === listIDName[j].id) {
				check = 1;
				break;
			}
		}
		if (check === 0) {
			listIDName.push(list[i]);
		}
	}
	return listIDName;
}

function filterAllProject(projectsTime, projectsIssues) {
	let list = projectsIssues;
	for (let i = 0; i < projectsTime.length; i++ ) {
		let check = 0;
		for (let j = 0; j < list.length; j++ ) {
			if (projectsTime[i].id === list[j].project_id) {
				check = 1;
				break;
			}
		}
		if (check === 0) {
			let obj = {
				project_id: projectsTime[i].id,
				project_name: projectsTime[i].name,
				estimated_hours: 0
			};
			list.push(obj);
		}
	}
	return list;
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

function findWorkLoad(startTime, endTime, sumRealTime) {
	var dayOff = getDayOffInStage(startTime, endTime);
	var days = getDaysInStage(startTime, endTime);
	var workload = Number(sumRealTime) / ((days - dayOff) * 8) * 100;
	workload = Math.round( workload * 100) / 100;
	return workload;
}

function getRealTime(listUsers, pos) {
	var realTime = 0;
	for (var i = 0; i < listUsers.length; i++) {
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

function tesssssssssssss() {
	var models = { issues, modelTime };
	var objWorkload = new workload(models, '2019-07-17', '2019-07-18');
	objWorkload.filterWorkload();
}

// tesssssssssssss()

// async function getIssuesStartEnd() {
// 	let modelIssues = issues.issues;
// 	let start = new Date('2019-07-01');
// 	let end = new Date('2019-07-18');
// 	let query = {
// 		start_date: {
// 			$gte: start,
// 			$lte: end
// 		}
// 	};
// 	let data = await modelIssues.find(query);
// 	let projects = [];
// 	let listIssues = data.map((item) => {
// 		if (projects.indexOf(item.project.name) === -1) {
// 			projects.push(item.project.name);
// 		}
// 		if (item.estimated_hours) {
// 			if (item.due_date && item.due_date > end) {
// 				let dayStart_End = ((end.getTime() - item.start_date.getTime()) / 1000/60/60/24) + 1;
// 				let dayStart_Due = ((item.due_date.getTime() - item.start_date.getTime()) / 1000/60/60/24) + 1;
// 				let realEstimated_hours = item.estimated_hours * dayStart_End / dayStart_Due;
// 				return {
// 					project: item.project,
// 					estimated_hours: realEstimated_hours
// 				};
// 			}
// 			else {
// 				return {
// 					project: item.project,
// 					estimated_hours: item.estimated_hours
// 				};
// 			}
// 		}
// 		else {
// 			return {
// 				project: item.project,
// 				estimated_hours: 0
// 			};
// 		}
// 	});
// 	let listProjects = [];
// 	for (let i = 0; i < projects.length; i++) {
// 		let project = projects[i];
// 		let estimated_hours = 0;
// 		let projectID = 0 ;
// 		for (let j = 0; j < listIssues.length; j++) {
// 			if (listIssues[j].project.name === project) {
// 				estimated_hours += listIssues[j].estimated_hours;
// 				projectID = listIssues[j].project.id;
// 				listIssues.splice(j, 1);
// 				j = j - 1;
// 			}
// 		}
// 		let objProject = {
// 			project_id: projectID,
// 			project_name: project,
// 			estimated_hours: estimated_hours
// 		};
// 		listProjects.push(objProject);
// 	}
// 	return listProjects;
// }

// async function getTimeEntriesStartEnd() {
// 	let modelTimeEntries = modelTime.timeEntries;
// 	let start = new Date('2019-07-01');
// 	let end = new Date('2019-07-18');
// 	let query = {
// 		spent_on: {
// 			$gte: start,
// 			$lte: end
// 		}
// 	};
// 	let data = await modelTimeEntries.find(query);
// 	return data;
// }

// function filterProject() {
// 	var listIssues = getIssuesStartEnd();
// 	listIssues.then((data) => {
// 		// console.log(data);
// 	})
// 	.catch(err => {
// 		console.log(err)
// 	});
// }

// filterProject();
// getTimeEntriesStartEnd()

// var startDate = new Date('2019-07-31');
// // Do your operations
// var endDate = new Date('2019-07-31');
// var seconds = (endDate.getTime() - startDate.getTime()) / 1000/60/60;
// console.log(startDate);
// console.log(endDate);
// console.log(seconds);

function checkDate() {
	var req = {
		query: {
			from: '2014-12-12',
			to: 'asasdas'
		}
	}
	var date = checkDateFromTo(req.query);
	console.log(date);
	console.log(new Date(date.from));
	console.log(new Date(date.to));
}

// checkDate();

function checkDateFromTo(query) {
	let from = getStartDateInMonth();
	let to = getEndDateInMonth();
	if (!query.from || !query.to) {
		console.log(1)
		return {
			from: from,
			to: to
		};
	}
	else {
		var dateFrom = new Date(query.from);
		var dateTo = new Date(query.to);
		console.log(dateFrom);
		console.log(dateTo);
		if (!isValidDate(dateFrom) || !isValidDate(dateTo)) {
			console.log(2);
			return {
				from: from,
				to: to
			};
		}
		else if (dateFrom > dateTo) {
			console.log(3)
			return {
				from: from,
				to: to
			};
		}
		else if (dateFrom < (new Date('2013-01-01'))) {
			console.log(4)
			return {
				from: from,
				to: to
			};
		}
		else {
			console.log(5)
			return query;
		}
	}
}

function isValidDate(d) {
	return d instanceof Date && !isNaN(d);
}

function getStartDateInMonth() {
	var year = new Date().getFullYear();
	var month = new Date().getMonth() + 1;
	month = (Number(month) < 10)?('0'+month):month;
	var startDate = year + '-' + month + '-01';
	return startDate;
}

function getEndDateInMonth() {
	var year = new Date().getFullYear();
	var month = new Date().getMonth() + 1;
	var lastDay = new Date(year, month, 1, -1).getDate();
	month = (Number(month) < 10)?('0'+month):month;
	var endDate = year + '-' + month + '-' + lastDay;
	return endDate;
}

// var ddd = new Date('2019/07/07');
// console.log(ddd);
// console.log(ddd.getDate());

// const saveTimeEntries = (models, { config }) => async (req, res, next) => {
// 	let timeEntriesTemp = models.timeEntries.timeEntriesTemp;
// 	let timeEntries = models.timeEntries.timeEntries;
// 	let dataTemp = await timeEntriesTemp.find({});
// 	await timeEntries.deleteMany({ });
// 	let offset = 3000;
// 	let length = dataTemp.length/offset;
// 	let intLenght = parseInt(length);
// 	if (intLenght < length) {
// 		intLenght = intLenght + 1;
// 	}
// 	for (let i = 0; i < intLenght; i++) {
// 		let start = i * offset;
// 		let end = start + offset;
// 		let dataInsert = dataTemp.slice(start, end);
// 		await timeEntries.insertMany(dataInsert);
// 	}
// 	res.status(200).send('Save mongo Time Entries success!!!');
// };

// function getDayOffInStage(startTime, endTime) {
// 	let days = endTime.diff(startTime, 'd');
// 	let dayOff = 0;
// 	for (var i = 0; i<= days; i++) {
// 		let dayStart = startTime.clone();
// 		let nextDate = dayStart.add(i, 'd');
// 		let day = nextDate.day();
// 		if (day === 0 || day === 6) {
// 			dayOff++;
// 		}
// 	}
// 	return dayOff;
// }

// function getDaysInStage(startTime, endTime) {
// 	let dayIn = endTime.diff(startTime, 'd') + 1;
// 	return dayIn;
// }

// function realWorkingDay() {
// 	var startTime = moment('2019-06-01');
// 	var endTime = moment('2019-07-31');
// 	console.log(startTime + '==' + endTime);
// 	let dayIn = getDaysInStage(startTime, endTime);
// 	let dayOff = getDayOffInStage(startTime, endTime);
// 	let dayWorking = dayIn - dayOff;
// 	console.log(dayOff);
// 	console.log(dayIn);
// 	console.log(dayWorking);
// }

// realWorkingDay();

// var startTime = moment('2019-06-01');
// var endTime = moment('2019-07-31');
// let dayIn = endTime.diff(startTime, 'd') + 1;
// console.log(dayIn);

// var a = moment().year(2019).month(5).date(35);
// console.log(a.day());

// var a = moment('2019-06-01').add(1, 'd');
// console.log(a.day());

// var now = moment('2019/01/01');
// console.log(now.isValid());

// var myArray = "vuongvm@rakumo.vn";
// console.log("The value of lastIndex is " + myArray.indexOf('@rakumo.vn'));

function getREmineTime(option, listProject, pos) {
	option.project_id = listProject[pos];
	var _apiTimeEntries = new apiTimeEntries();
	try {
		_apiTimeEntries.getAllTimeEntries(option, (data) => {
			if (typeof data === 'object') {
				console.log(data.offset + ' - ' + data.time_entries[0].id);
				let offset = data.offset;
				let total_count = data.total_count;
				let nextOffset = offset + 100;
				if (nextOffset < total_count) {
					option.offset = nextOffset;
					return getREmineTime(option, listProject, pos);
				}
				else {
					pos++;
					if (pos >= listProject.length) {
						console.log('success');
						return;
					}
					else {
						return getREmineTime(option, listProject, pos)
					}
				}
			}
			else {
				return getREmineTime(option, listProject, pos);
			}
		});
	}
	catch(e) {
		return getREmineTime(option, listProject, pos);
	}
}

function getMutiProject() {
	let option = {
		from: '2013-01-01',
		to: '2019-07-29',
		offset: 0,
		project_id: 0
	};
	let listProject = [80];
	getREmineTime(option, listProject, 0);
}

async function findIssuesByPrijectID() {
	var modelissues = issues.issues;
	let query = {
		'project.id': 189,
		is_private: true
	};
	let listIssues = modelissues.find(query);
	return listIssues;
}

// findIssuesByPrijectID().then((data) => {
// 	console.log(data);
// });

// var timeEntries = require('./src/models/time-entries');
// var issues = require('./src/models/issues');
// const { apiIssues } = require('./src/redmine/issues');

// const syncDataIssues = require('./src/controllers/sync-issues/syncIssues');

// function testSyncIssues() {
// 	let models = {timeEntries, Project, issues, apiIssues};
// 	let classIssue = new syncDataIssues(models);
// 	classIssue.saveIssuesMongo();
// }
// testSyncIssues();


function getNewHtmlproject() {
	var apiProject = new apiProject();
	apiProject.getProjectNews(189, (data) => {
		console.log(data);
	});
}

function testCompareDate() {
	let a = new Date('2019-07-29T00:00:00.000+00:00').getTime();
	let b = new Date('2019-07-29').getTime();
	console.log(a);
	console.log(b);
	if(a === b) {
		console.log('bang nhau');
	}
}
// testCompareDate();

// function testtttttEval() {
// 	let listProjects = [25,36,74,58,79,45,75,84];
// 	let projects = {};
// 	for (let i = 0; i < listProjects.length; i++) {
// 		projects[listProjects[i]] = 0;
// 	}
// 	console.log(projects);
// }
// testtttttEval();

async function insertHoliday() {
	let oneholiday = new holiday();
	oneholiday.name = 'tháng 7 nghỉ 2';
	oneholiday.from = new Date('2019-07-19');
	oneholiday.to = new Date('2019-07-20');
	await oneholiday.save();
}
// insertHoliday();

async function getholiday() {
	let start = new Date('2019-07-27');
	let end = new Date('2019-07-27');
	let query = {
		$or: [
			{
				from: {
					$gte: start,
					$lte: end
				}
			},
			{
				to: {
					$gte: start,
					$lte: end
				}
			},
			{
				from: {
					$lt: start
				},
				to: {
					$gt: end
				}
			}
		]
	};
	let data = await holiday.find(query);
	console.log(data);
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
	console.log(dayIn);
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



async function getWorkingDay() {
	let start = new Date('2019-06-01');
	let end = new Date('2019-06-30');
	let query = {
		$or: [
			{
				from: {
					$gte: start,
					$lte: end
				}
			},
			{
				to: {
					$gte: start,
					$lte: end
				}
			},
			{
				from: {
					$lt: start
				},
				to: {
					$gt: end
				}
			}
		]
	};
	let listHoliday = await holiday.find(query);
	let offHoliday = 0;
	if (listHoliday.length !== 0) {
		for (let i = 0; i < listHoliday.length; i++) {
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
					if (date >= start && date <= end) {
						let day = nextDate.day();
						if (day !== 0 && day !== 6) {
							offHoliday++;
						}
					}
				}
			}
		}
	}
	var startTime = moment(start);
	var endTime = moment(end);
	let dayIn = getDaysInStage(startTime, endTime);
	let dayOff = getDayOffInStage(startTime, endTime);
	let dayWorking = dayIn - dayOff - offHoliday;
	console.log(dayWorking);
	return dayWorking;
}

// getWorkingDay()

// const { syncData } = require('./src/models/sync-data');

// function createSync() {
// 	let sync = new syncData;
// 	sync.running = false;
// 	sync.from = new Date();
// 	sync.save((err, product) => {
// 		if (err) throw err;
// 		console.log(product);
// 	});
// }
// // createSync();
// async function findLastSync() {
// 	let query = {};
// 	let data = await syncData.findOne(query).sort({ from: -1 });
// 	console.log(data);
// }
// // findLastSync();
// async function updateSync() {
// 	let query = {};
// 	let data = await syncData.findOne(query).sort({ from: -1 });

// 	await syncData.updateOne({_id: data._id}, {running: true, to: new Date()}, (err, product) => {
// 		if (err) throw err;
// 		console.log(product);
// 	});
// }
// updateSync();

// async function testSync() {
// 	const syncManagement = require('./src/lib/sync-data');
// 	let synData = new syncManagement();
// 	let data = await synData.getLastCompleteSync();
	
// }

// testSync();

// function testcai() {
// 	let b = moment();
// 	console.log(b.format('YYYY-MM-DD hh-mm-ss'));
// 	let a = moment('2019-08-06T07:10:00.046Z');
// 	a.add(1, 'hours');
// 	console.log(a.format('YYYY-MM-DD hh-mm-ss'));
// 	if (a > b) {
// 		console.log('dasdsada');
// 	}
// }

// testcai()
// let a = moment('2019-08-06T09:47:44.321+00:00');
// console.log(a.format('YYYY-MM-DD HH:mm:ss'));

var clouse = (a) => {
	console.log(a);
	let b = 10;
	console.log(b);
	return function(c) {
		console.log(c);
		console.log(a + b + c);
	}
}
// clouse(5)(15);

// const nodemailer = require('nodemailer');
// const EmailTemplate = require('email-templates').;

// async function sendmail() {
// 	const transporter = nodemailer.createTransport(config.mailConfig);
// 	var mailTemplate = {
// 		from: config.mailConfig.auth.user,
// 		to: '',
// 		cc: 'thaipt@rakumo.vn',
// 		subject: '1 cái gì đó',
// 		text: 'test chơi',
// 		html: 'test cái'
// 	}
// 	await transporter.sendMail(mailTemplate);
// }

// function renderHTMl() {
// 	var template = EmailTemplate.EmailTemplate;
	
// }

function makeid() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 30; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

async function findNonWorking() {
	let from = new Date('2019-08-21');
	let to = new Date('2019-08-21');
	let query = {
		status: 'approve'
	};
	let queryDay = {
		day: {
			$gte: from,
			$lte: to
		}
	};
	let fields = {
		mail: 1,
		time: 1,
		days: 1
	}
	let data = await NonWorking.find(query).elemMatch('days', queryDay).select(fields);
	console.log(data)
	return data;
}
// findNonWorking()

async function addNonWorkingDayOff() {
	let nons = [];
	let listMail = ['ngo.truc@gigei.jp', 'phan.thai@gigei.jp', 'le.nghia@gigei.jp'];
	for (let i = 0; i < listMail.length; i++) {
		let non = {
			name: 'not found!!!',
			mail: listMail[i],
			type: "dayoff",
			team: "Rak.open",
			to: [{mail:'tran.ngan@gigei.jp'}],
			cc: [
				{mail:'phan.thai@gigei.jp'}, {mail:'le.nghia@gigei.jp'}, {mail:'ngo.truc@gigei.jp'},
			],
			subject: 'test non working',
			reason: 'only test',
			status: 'approve',
			time: 24,
			days: [
				{day: new Date('2019-08-19')}, {day: new Date('2019-08-20')}, {day: new Date('2019-08-21')}
			],
			created : new Date('2019-08-16'),
			updated: new Date('2019-08-17'),
		};
		nons.push(non);
	}
	let data = await NonWorking.insertMany(nons);
	for (let i = 0; i < data.length; i++) {
		let time = moment(data[i].created).add(8, 'd');
		let update = {
			token: {
				id: data[i]._id,
				time: time
			}
		}
		await NonWorking.findOneAndUpdate({_id: data[i]._id}, update);
	}
}

async function addNonWorkingLate() {
	let nons = [];
	let listMail = ['ngo.truc@gigei.jp', 'phan.thai@gigei.jp', 'le.nghia@gigei.jp'];
	for (let i = 0; i < listMail.length; i++) {
		let non = {
			name: 'not found!!!',
			mail: listMail[i],
			type: "late",
			team: "Rak.open",
			to: [{mail:'tran.ngan@gigei.jp'}],
			cc: [
				{mail:'phan.thai@gigei.jp'}, {mail:'le.nghia@gigei.jp'}, {mail:'ngo.truc@gigei.jp'},
			],
			subject: 'test non working',
			reason: 'only test',
			status: 'approve',
			time: 1,
			days: [
				{day: new Date('2019-08-22')}
			],
			created : new Date('2019-08-22'),
			updated: new Date('2019-08-22'),
		};
		nons.push(non);
	}
	let data = await NonWorking.insertMany(nons);
	for (let i = 0; i < data.length; i++) {
		let time = moment(data[i].created).add(8, 'd');
		let update = {
			token: {
				id: data[i]._id,
				time: time
			}
		}
		await NonWorking.findOneAndUpdate({_id: data[i]._id}, update);
	}
}

// addNonWorkingDayOff();
// addNonWorkingLate();

async function checkMailAndUpdateStatus(tokenID) {
	let query = {
		'token.id': tokenID
	};
	let data = await NonWorking.findOne(query).catch(err => null);
	if (data === null) {
		return 1;
	}
	else if (data.status !== 'new') {
		return 2;
	}
	else {
		let tokenTime = moment(data.token.time);
		let now = moment();
		if (now < tokenTime) {
			let update = {

			};
			await NonWorking.findOneAndUpdate({}, update);
		}
		else {
			return 3;
		}
	}
}

if (moment() > moment('2019-09-06T00:00:00.000+00:00')) {
	console.log(moment().format('YYYY-MM-DD'));
}