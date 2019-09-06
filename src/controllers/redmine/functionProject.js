const _ = require('lodash');
const mongoose = require('mongoose');
const Project = mongoose.model('Project');
const ProjectTemp = mongoose.model('ProjectTemp');

class syncDataProject {
	constructor(models) {
		this.apiProject = models.apiProject;
    }

    saveProject() {
        var arr = [];
        var maxLimit = 100;
        var offset = 0;
        var offsetLimit = 1000;

        return new Promise((resolve, reject) => {
            let apiProject = this.apiProject;
            var _apiProject = new apiProject()

            Project.deleteMany({}, function(err) { 
                console.log('Project documents removed');
            });

            ProjectTemp.deleteMany({}, function(err) { 
                console.log('ProjectTemp documents removed');
            });

            for (var i = 0; i < offsetLimit/100; i++) {
                (function (i) {
                    setTimeout(function () {
                        _apiProject.getAll(maxLimit,offset,function(data) {

                            let isEmpty = false;
                            let first = data.projects[0];

                            if (first == undefined) {
                                isEmpty = true;
                            }

                            if (isEmpty != true) {
                                
                                let arr = [];
                                console.log(offset);

                                let projects = data.projects;
                                arr.push(projects);
                                
                                offset += 100;

                                for (var a = 0; a < arr[0].length; a++) {
                                    // insert to collection project
                                    let projectObj = new Project();
                                    projectObj.id = arr[0][a].id;
                                    projectObj.name = arr[0][a].name;
                                    projectObj.identifier = arr[0][a].identifier;
                                    if (arr[0][a].parent) {
                                    projectObj.parent = arr[0][a].parent;
                                    }
                                    projectObj.status = arr[0][a].status;
                                    projectObj.created_on = arr[0][a].created_on;
                                    projectObj.updated_on = arr[0][a].updated_on;
                                    projectObj.save((err,doc) => { });
                                }

                                for (var b = 0; b < arr[0].length; b++) {
                                    // insert to collection projectTemp
                                    let projectObjTemp = new ProjectTemp();
                                    projectObjTemp.id = arr[0][b].id;
                                    projectObjTemp.name = arr[0][b].name;
                                    projectObjTemp.identifier = arr[0][b].identifier;
                                    if (arr[0][b].parent) {
                                        projectObjTemp.parent = arr[0][b].parent;
                                    }
                                    projectObjTemp.status = arr[0][b].status;
                                    projectObjTemp.created_on = arr[0][b].created_on;
                                    projectObjTemp.updated_on = arr[0][b].updated_on;
                                    projectObjTemp.save((err,doc) => { });

                                }
                            } else {
                                resolve();
                            }
                        })
                    }, 5000*i);
                })(i);
            }
            //resolve();
        });
    }
}


module.exports = syncDataProject;
