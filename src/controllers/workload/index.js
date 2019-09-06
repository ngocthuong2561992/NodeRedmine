const express = require('express');
const classWorkload= require('./workload');
const filterUser = require('./project-users');
const moment = require('moment');

var workloadController = (models, config) => {
	let router = express.Router();

	router.get('/', (req, res) => {
		let date = checkDateFromTo(req.query);
		let objWorkload = new classWorkload(models, date.from, date.to);
		objWorkload.filterWorkload((workload) => {
			res.render("workload/workload", {
				from: date.from,
				to: date.to,
				workload: workload,
				email: req.user.email,
				role: req.user.role
			});
		});
	});

	router.get('/getProjectUser', async (req, res) => {
		let projectIDs = req.query.projectIDs;
		let projectUser = new filterUser(models);
		let listUser = await projectUser.filterProjectUsers(projectIDs);
		res.status(200).send(listUser);
	});

	return router;
};

/**
  * @desc check date in query client request
  * @param object query - data client request
  * @return object - ex: {from: 2019-01-01, to: 2019-01-31}
*/
function checkDateFromTo(query) {
	let from = getStartDateInMonth();
	let to = getEndDateInMonth();
	if (!query.from || !query.to) {
		return {
			from: from,
			to: to
		};
	}
	else {
		var dateFrom = new Date(query.from);
		var dateTo = new Date(query.to);
		if (!isValidDate(dateFrom) || !isValidDate(dateTo)) {
			return {
				from: from,
				to: to
			};
		}
		else if (dateFrom > dateTo) {
			return {
				from: from,
				to: to
			};
		}
		else if (dateFrom < (new Date('2013-01-01'))) {
			return {
				from: from,
				to: to
			};
		}
		else {
			return query;
		}
	}
}

/**
  * @desc check date type
  * @param date d - date type
  * @return boolean - true or false
*/
function isValidDate(d) {
	return d instanceof Date && !isNaN(d);
}

/**
  * @desc get start day in month
  * @return string - ex: 2019-08-01
*/
function getStartDateInMonth() {
	let now = moment();
	let startDate = now.startOf('month').format('YYYY-MM-DD');
	return startDate;
}

/**
  * @desc get last day in month
  * @return string - ex: 2019-08-31
*/
function getEndDateInMonth() {
	let now = moment();
	let endDate = now.endOf('month').format('YYYY-MM-DD');
	return endDate;
}

module.exports = workloadController;