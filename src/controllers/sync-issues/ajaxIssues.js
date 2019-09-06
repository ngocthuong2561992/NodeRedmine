const getIssuesAndSave = ( models, config) => async (req, res, next) => {
	let apiIssues = models.apiIssues;
	let _apiIssues = new apiIssues();
	let modelIssuesTemp = models.issues.issuesTemp;
	let option = {
		offset: req.query.offset
	};
	let Project = models.Project;
	let listProject = await listProjectID(Project);
	try {
		_apiIssues.getAllIssues(option, async (data) => {
			if (typeof data === 'object') {
				let listIssues = data.issues.filter((item) => {
					if (listProject.indexOf(item.project.id) !== -1) {
						return item;
					}
				});
				await modelIssuesTemp.insertMany(listIssues);
				res.status(200).send('save success: offset ' + data.offset);
			}
			else {
				next();
			}
		});
	}
	catch(e) {
		next();
	}
};

async function listProjectID(Project) {
	let query = {
		status: {
			$eq: 1
		} 
	};
	let data = await Project.find(query);
	let listProject = data.map((project) => {
		return project.id;
	});
	return listProject;
}

module.exports= getIssuesAndSave;