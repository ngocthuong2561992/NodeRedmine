const express = require('express');
const projectDetail = require('./project-detail');
const moment = require('moment');

var projectDetailController = (models, config) => {
	let router = express.Router();

	router.get('/:project_id' + '.html', async (req, res) => {
		let project = new projectDetail(models, req.params.project_id);
		let project_info = await project.getDataProject();
		if (project_info === null) {
			res.status(404).render('404', {
				layout: false
			});
		}
		else {
			let from = moment(project_info.created_on).format('YYYY-MM-DD');
			let date = checkDateFromTo(req.query, from);
			let detail = await project.createProjectDetail(date.from, date.to);
			res.render("project-detail", {
				from: date.from,
				to: date.to,
				detail: detail,
				email: req.user.email,
				role: req.user.role
			});
		}
	});

	return router;
};

/**
  * @desc check date in query client request
  * @param object query - data client request
  * @param any from - ex: 2019-01-01
  * @return object - ex: {from: 2019-01-01, to: 2019-01-31}
*/
function checkDateFromTo(query, from) {
	let to = getEndDateInMonth();
	if (!query.from || !query.to) {
		return { from, to} ;
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
  * @desc get last day in month
  * @return string - ex: 2019-08-31
*/
function getEndDateInMonth() {
	let now = moment();
	let endDate = now.endOf('month').format('YYYY-MM-DD');
	return endDate;
}

module.exports = projectDetailController;