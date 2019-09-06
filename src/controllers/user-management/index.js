const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Employee = mongoose.model('Employee');
const AllModal = require('../../../constant');
const textModal = AllModal.textUserManagementModal;

var minLength = 2;
var maxLength = 50;

const query = {
	role: {
		$not: {
			$eq: 'user'
		}
	}
}

router.get('/', (req, res) => {
	findAll(req,res);
});

router.get('/delete/:id', (req, res) => {
	Employee.findByIdAndDelete(req.params.id,(err,doc) => {
		if (!err) {
			res.redirect('/user-management');
		} else {
			console.log('Error during delete record : ' + err);
		}
	});
});

router.get('/updateName/:id/:value', (req, res) => {

	let id = req.params.id;
	let changeVal = req.params.value;

	update("name", id, changeVal, req, res);
});

router.get('/updateGSuit/:id/:value', (req, res) => {

	let id = req.params.id;
	let changeVal = req.params.value;

	update("gsuit", id, changeVal, req, res);
});

router.post('/new', (req, res) => {

	let name = req.body.name;
	let gsuit = req.body.gsuit;
	let idx = gsuit.lastIndexOf('@');

	if (name == "" || gsuit == "") {
		checkEmpty(req, res, name, gsuit);
	}
	else if (name != "" && gsuit != "") {
		if (name.length < minLength || gsuit.length < minLength) {
			errMinMaxLength(req, res, name, gsuit, "min");
		} else if (name.length > maxLength || gsuit.length > maxLength) {
			errMinMaxLength(req, res, name, gsuit, "max");
		} else if ((name.length >= minLength && name.length <= maxLength) && (gsuit.length >= minLength && gsuit.length <= maxLength)) {
			if (idx > -1 && gsuit.slice(idx + 1) === 'gigei.jp') {
				findOneAndInsert(req, res, name, gsuit);
			} else {
				checkGSuit(req, res, name, gsuit);
			}
		}
	}

});

function update(editString, id, changeVal, req, res) {
	if (editString == "name") {
		if (changeVal == "empty") {
			checkEmpty(req, res);
		} else {
			if (changeVal.length < minLength) {
				errMinMaxLength(req, res, "", "", "min");
			} else if (changeVal.length > maxLength) {
				errMinMaxLength(req, res, "", "", "max");
			} else if (minLength < changeVal.length < maxLength) {
				Employee.find({ name: changeVal })
				.then(result => {
					if (result.length) {
						exist(req, res);
					} else {
						Employee.findOneAndUpdate({ _id: id } ,{ name: changeVal },(err,doc) => {
							if (!err) {
								res.redirect('/user-management');
							} else {
								console.log('Error during update record : ' + err);
							}
						});
					}
				});
			}
		}
	} else if (editString == "gsuit") {
		if (changeVal == "empty") {
			checkEmpty(req, res);
		} else {
			if (changeVal.length < minLength) {
				errMinMaxLength(req, res, "", "", "min");
			} else if (changeVal.length > maxLength) {
				errMinMaxLength(req, res, "", "", "max");
			} else if (minLength < changeVal.length < maxLength) {
				let idx = changeVal.lastIndexOf('@');
				if (idx > -1 && changeVal.slice(idx + 1) === 'gigei.jp') {
					Employee.find({ gsuit: changeVal })
					.then(result => {
						if (result.length) {
							exist(req, res);
						} else {
							Employee.findOneAndUpdate({ _id: id } ,{ gsuit: changeVal },(err,doc) => {
								if (!err) {
									res.redirect('/user-management');
								} else {
									console.log('Error during update record : ' + err);
								}
							});
						}
					});
				} else {
					checkGSuit(req, res);
				}
			}
		}
	}
}

function errMinMaxLength(req, res, name="", gsuit="", status){
	if (status == 'min') {
		var textErr = textModal.errMin;
	} else {
		var textErr = textModal.errMax;
	}
	Employee.find(query, (err,docs) => {
		if (!err) {
			res.render("user-management", {
				mygsuit: req.user.email,
				list : docs,
				length : docs.length,
				name : name,
				gsuit : gsuit,
				textErr : textErr,
				errExist : status,
				email: req.user.email,
				role: req.user.role,
				errSpecial : textModal.errSpecialCharacter
			});
		} else {
			console.log('Error load list page');
		}
	});
}

function checkGSuit(req, res,name="", gsuit=""){
	Employee.find(query, (err,docs) => {
		if (!err) {
			res.render("user-management", {
				mygsuit: req.user.email,
				list : docs,
				length : docs.length,
				name : name,
				gsuit : gsuit,
				errExist : 'error_gsuit',
				textErr : textModal.errAddGSuit,
				email: req.user.email,
				role: req.user.role,
				errSpecial : textModal.errSpecialCharacter
			});
		} else {
			console.log('Error load list page');
		}
	});
}

function checkEmpty(req, res, name="", gsuit="") {
	Employee.find(query, (err,docs) => {
		if (!err) {
			res.render("user-management", {
				mygsuit: req.user.email,
				list : docs,
				length : docs.length,
				name : name,
				gsuit : gsuit,
				textErr : textModal.errAddEmpty,
				errExist : 'empty',
				email: req.user.email,
				role: req.user.role,
				errSpecial : textModal.errSpecialCharacter
			});
		} else {
			console.log('Error load list page');
		}
	});
}

function findOneAndInsert(req, res, name="", gsuit=""){
	Employee.findOne().or([{ name: name }, { gsuit:gsuit }])
	.then(result => {
		if (result !== null) {
			if (result.gsuit === gsuit && result.role === 'user') {
				updateRole(req, res, result._id, name);
			}
			else {
				exist(req, res, name, gsuit);
			}
		} else {
			insertRecord(req, res);
		}
	})
	.catch(error => {
		console.log('Error!');
	})
}

function exist(req, res, name="", gsuit="") {
	Employee.find(query, (err,docs) => {
		if (!err) {
			res.render("user-management", {
				mygsuit: req.user.email,
				list : docs,
				length : docs.length,
				name : name,
				gsuit : gsuit,
				textErr : textModal.errExist,
				errExist : 'exist',
				email: req.user.email,
				role: req.user.role,
				errSpecial : textModal.errSpecialCharacter
			});
		} else {
			console.log('Error load list page');
		}
	});
}

function updateRole(req, res, id, name) {
	Employee.findOneAndUpdate({ _id: id } ,{ role: 'pm', name: name },(err,doc) => {
		if (!err) {
			res.redirect('/user-management');
		} else {
			console.log('Error during update record : ' + err);
		}
	});
}

function insertRecord(req, res) {
	var employee = new Employee();

	employee.name = req.body.name;
	employee.gsuit = req.body.gsuit;
	employee.role = "pm";
	
	employee.save((err,doc) => {
		if (!err) {
			res.redirect('/user-management');
		} else {
			console.log('Error during record insertion : ' + err);
		}
	});
}

function findAll(req,res) {
	Employee.find(query ,(err,docs) => {
		if (!err) {
			res.render("user-management", {
				mygsuit: req.user.email,
				list : docs,
				length : docs.length,
				errExist : 'normal',
				email: req.user.email,
				role: req.user.role,
				errSpecial : textModal.errSpecialCharacter
			});
		} else {
			console.log('Error load list page');
		}
	});
}

module.exports = router;
