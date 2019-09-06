class syncDataNews {
	constructor(model) {
		this.modelNew = model.News.News;
		this.modelNewsTemp = model.News.NewsTemp;
		this.Project = model.Project;
		this.apiNew = new model.apiNew();
		this.listProject = [];
	}

	async listProjectID() {
		let query = {
			status: {
				$eq: 1
			}
		};
		let fields = {
			id: 1
		};
		let data = await this.Project.find(query, fields);
		let listProject = data.map((project) => {
			return project.id;
		});
		return listProject;
	}

	async saveMainModelNews() {
		let total_count = await this.modelNewsTemp.countDocuments({ });
		await this.modelNew.deleteMany({ });
		let limit = 100;
		let length = total_count/limit;
		let intLenght = parseInt(length);
		if (intLenght < length) {
			intLenght = intLenght + 1;
		}
		for (let i = 0; i < intLenght; i++) {
			let skip = i * limit;
			let dataTemp = await this.modelNewsTemp.find({}).skip(skip).limit(limit);
			await this.modelNew.insertMany(dataTemp);
		}
		console.log('Insert to news :' + total_count + ' documents');
		return 'Save mongodb news ' + total_count + ' documents';
	}

	getNewsRedmine(offset = 0) {
		let option = {
			offset: offset
		};
		try {
			this.apiNew.getNewJson(option, async (data) => {
				if (typeof data === 'object') {
					let listNews = data.news.filter((item) => {
						if (this.listProject.indexOf(item.project.id) !== -1) {
							return item;
						}
					});
					if (listNews.length > 0) {
						await this.modelNewsTemp.insertMany(listNews);
					}
					let offset = data.offset;
					let total_count = data.total_count;
					let nextOffset = offset + 100;
					if (nextOffset >= total_count) {
						console.log('Success at offset: ' + offset);
						return this.saveMainModelNews();
					}
					else {
						return this.getNewsRedmine(nextOffset);
					}
				}
				else {
					return this.getNewsRedmine(offset);
				}
			});
		}
		catch(e) {
			return this.getNewsRedmine(offset);
		}
	}

	async saveNewsMongo() {
		let listProject = await this.listProjectID();
		this.listProject = listProject;
		await this.modelNewsTemp.deleteMany({ });
		this.getNewsRedmine();
		return "Save News to mongo success!!!";
	}
}

module.exports = syncDataNews;

