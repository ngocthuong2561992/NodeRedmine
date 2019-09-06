const { Employee } = require('./employee');
const { Holiday } = require('./holiday');
const issues = require('./issues');
const MailList = require('./mail-list');
const News = require('./news');
const NonWorking = require('./non-working');
const { Project } = require('./project');
const Membership = require('./project-membership');
const { syncData } = require('./sync-data');
const timeEntries = require('./time-entries');
const { User } = require('./user');

module.exports = { Employee, Holiday , issues , MailList, News , NonWorking, Project, Membership, syncData, timeEntries, User };