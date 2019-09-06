const express = require('express');
const cron = require('node-cron');

const { errorHandler } = require('../middleware');
const syncManagement = require('../lib/sync-data');
// list of models here

const { Project } = require('../models/project');
const Employee = require('../models/employee');
const { User } = require('../models/user');
const timeEntries = require('../models/time-entries');
const issues = require('../models/issues');
const { holiday } = require('../models/holiday');
const News = require('../models/news');
const Membership = require('../models/project-membership');
const NonWorking = require('../models/non-working');

const { apiProject } = require('../redmine/project');
const { apiUser } = require('../redmine/user');
const { apiTimeEntries } = require('../redmine/time-entries');
const { apiIssues } = require('../redmine/issues');
const { apiNew } = require('../redmine/new');
const { apiMembership } = require('../redmine/project-membership');

// list of controllers here
const redmine = require('../controllers/redmine');
const auth = require('../controllers/auth');
const workloadController = require('../controllers/workload');
const userManagementController = require('../controllers/user-management');
const holidayManagementController = require('../controllers/holiday-management');
const userDetailController = require('../controllers/user-detail');
const projectDetailController = require('../controllers/project-detail');
const syncTimeEntries = require('../controllers/sync-time-entries');
const syncIssues = require('../controllers/sync-issues');
const suycNews = require('../controllers/sync-news');
const suycMembership = require('../controllers/sync-project-membership');
const { nonWorkingController, replyMailController } = require('../controllers/non-working');

const cronUser = require('../controllers/redmine/functionUsers');
const cronProject = require('../controllers/redmine/functionProject');
const cronRedmine = require('../lib/sync-Redmine');

// combine models ino one object
const models = { 
	Project, User, timeEntries, issues, holiday, News, Membership, NonWorking,
	apiProject, apiUser, apiTimeEntries, apiIssues ,Employee,
	syncManagement, apiNew, apiMembership
};

const routersInit = config => {
	const router = express();

	// register api points
	router.use('/redmine', redmine(models, { config }));
	router.use('/auth', auth(models, { config }));

	router.use('/syncDataTimeEntries', checkRoleLogin('admin'), syncTimeEntries(models, config));
	router.use('/syncDataIssues', checkRoleLogin('admin'), syncIssues(models, config));
	router.use('/syncDataNews', checkRoleLogin('admin'), suycNews(models));
	router.use('/syncDataMembership', checkRoleLogin('admin'), suycMembership(models));

	// render workload
	router.use("/workload", checkRoleLogin('admin', 'pm'), workloadController(models, config));
	// render project detail
	router.use("/project-detail", checkRoleLogin('admin', 'pm'), projectDetailController(models, config));
	// render user-detail
	router.use("/user-detail", checkRoleLogin('admin', 'pm'), userDetailController);
	// render holiday-management
	router.use("/holiday-management", checkRoleLogin('admin'), holidayManagementController);
	// render user-management
	router.use("/user-management", checkRoleLogin('admin'), userManagementController);
	// render non-working
	router.use("/non-working", checkRoleLogin('admin', 'pm', 'user'), nonWorkingController(models, config));
	
	// Redirect reply mail
	router.use("/reply-mail", replyMailController(models, config));

	router.use('/', redirectPageWithUser);

	// catch api all errors
	router.use(errorHandler);
	return router;
};

var checkRoleLogin = (...roles) => (req, res, next) => {
	if (!req.isAuthenticated()) {
		res.redirect('/auth/login');
	}
	else {
		if (roles.indexOf(req.user.role) !== -1) {
			return next();
		}
		res.status(403).render('403', {
			layout: false
		});
	}
}

var redirectPageWithUser = (req, res) => {
	if (!req.isAuthenticated()) {
		res.redirect('/auth/login');
	}
	else if (req.user.role === 'admin' || req.user.role === 'pm')
	{
		res.redirect('/workload');
	}
	else {
		res.redirect('/non-working');
	}
} 

cron.schedule('0 3 11 * * *', async () => {
	console.log('running a task every midnight');
	let syncData = new syncManagement();
	let data = await syncData.createSync();
	let classUser = new cronUser(models);
	classUser.saveUser();

	let classProject = new cronProject(models);
	let syncProject = classProject.saveProject();

	syncProject.then(() => {
		let classNews = new cronRedmine.syncNews(models);
		classNews.saveNewsMongo();

		let classMembership = new cronRedmine.syncMembership(models);
		classMembership.saveMembershipsMongo();

		let classIssue = new cronRedmine.syncIssues(models);
		classIssue.saveIssuesMongo();

		let classTimeEntries = new cronRedmine.syncTimeEntries(models);
		classTimeEntries.saveTimeEntriesMongo(data._id);
	}).catch(err => {
		console.log(err);
	});
	
});

module.exports = routersInit;
