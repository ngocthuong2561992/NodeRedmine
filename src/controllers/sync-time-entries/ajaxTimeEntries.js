const getTimeEntriesAndSave = ( models ) => async (req, res, next) => {
	let apiTimeEntries = models.apiTimeEntries;
	let _apiTimeEntries = new apiTimeEntries();
	let modelTimeEntriesTemp = models.timeEntries.timeEntriesTemp;
	let option = {
		from: req.query.from,
		to: req.query.to,
		offset: req.query.offset
	};
	let Project = models.Project;
	let listProject = await listProjectID(Project);
	try {
		_apiTimeEntries.getAllTimeEntries(option, (data) => {
			if (typeof data === 'object') {
				let listTimeEntries = data.time_entries.filter((item) => {
					if (listProject.indexOf(item.project.id) !== -1) {
						return item;
					}
				});
				modelTimeEntriesTemp.insertMany(listTimeEntries);
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

module.exports= getTimeEntriesAndSave;