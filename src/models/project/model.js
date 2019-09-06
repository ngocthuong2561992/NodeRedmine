const mongoose = require('mongoose');
const { schema } = require('./schema');
const Project = mongoose.model('Project', schema, 'project');
const ProjectTemp = mongoose.model('ProjectTemp', schema, 'projectTemp');


module.exports = { Project, ProjectTemp };
