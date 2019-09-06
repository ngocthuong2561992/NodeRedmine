const { Router: router } = require('express');

const { getProjects } = require('./getProjects');
const { getApiProjects } = require('./getApiProjects');
const { getApiUsers } = require('./getApiUsers');
const { getApiTimeEntries } = require('./getApiTimeEntries');
const { getApiIssues } = require('./getApiIssues');
const { getApiNew }= require('./getApiNews');
const { getApiMembership }= require('./getApiMembership');


/**
 * Provide api for questions
 *
 *
 * GET /api/v1/questions/ - List
		 @header
						Authorization: Bearer {token}
		 @optionalQueryParameters
					 search {String} - value to search
					 limit {Number} - count of item to send
					 skip {Number} - value to search
 *
 *
 * **/

module.exports = (models, { config }) => {
	const api = router();

	api.get('/getProjects', getProjects(models, { config }));
	api.get('/getApiProjects', getApiProjects(models, { config }));
	api.get('/getApiUsers', getApiUsers(models, { config }));
	api.get('/getApiTimeEntries', getApiTimeEntries(models, { config }));
	api.get('/getApiIssues', getApiIssues(models, { config }));
	api.get('/getApiNew/:type', getApiNew(models));
	api.get('/getApiMembership', getApiMembership(models));

	return api;
};
