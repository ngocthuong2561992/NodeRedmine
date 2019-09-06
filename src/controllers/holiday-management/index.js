const express = require('express');
const _ = require('lodash');
const router = express.Router();
const moment = require('moment');
const mongoose = require('mongoose');
const Holiday = mongoose.model('holiday');
const AllModal = require('../../../constant');
const textModal = AllModal.textHolidayManagementModal;

var minLength = 2;
var maxLength = 50;

router.get('/', async (req, res) => {
    findAll(req, res);
});

router.get('/delete/:id', (req, res) => {
	Holiday.findByIdAndDelete(req.params.id,(err,doc) => {
        if (!err) {
			res.redirect('/holiday-management');
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

router.get('/updateDateFrom/:id/:value', (req, res) => {

    let id = req.params.id;
    let changeVal = req.params.value;

    update("datefrom", id, changeVal, req, res);
});

router.get('/updateDateTo/:id/:value', (req, res) => {

    let id = req.params.id;
    let changeVal = req.params.value;

    update("dateto", id, changeVal, req, res);
});

router.post('/new', async (req, res) => {

	let name = req.body.name;
    let from = req.body.from;
    let to = req.body.to;
    let dateFrom = new Date(from);
    let dateTo = new Date(to);
    if (name == "" || from == "" || to == "") {
        checkEmpty(req, res, name, from, to);
    } else {
        if (dateFrom > dateTo) {
            await errGreaterSmaller(req, res, name, from, to, "from-greater-to");
            return;
        }
        if (name.length < minLength) {
            errMinMaxLength(req, res, name, from, to, "min");
        } else if (name.length > maxLength) {
            errMinMaxLength(req, res, name, from, to, "max");
        } else if (name.length >= minLength && name.length <= maxLength) {
            findOneAndInsert(req, res, name, from, to);
        }
    }
});

function update(editString, id, changeVal, req, res) {
    if (editString == "name") {
        updateName(id, changeVal, req, res);
    } else if (editString == "datefrom") {
        updateDateFrom(id, changeVal, req, res);
    } else if (editString == "dateto") {
        updateDateTo(id, changeVal, req, res);
    }
}

function updateName(id, changeVal, req, res){
    if (changeVal == "empty") {
        checkEmpty(req, res);
    } else {
        if (changeVal.length < minLength) {
            errMinMaxLength(req, res, "", "", "", "min");
        } else if (changeVal.length > maxLength) {
            errMinMaxLength(req, res, "", "", "", "max");
        } else if (minLength < changeVal.length < maxLength) {
            Holiday.find({ name: changeVal })
            .then(result => {
                if (result.length) {
                    exist(req, res);
                } else {
                    Holiday.findByIdAndUpdate(id,{ name: changeVal },(err,doc) => {
                        if (!err) {
                            res.redirect('/holiday-management');
                        } else {
                            console.log('Error during update record : ' + err);
                        }
                    });
                }
            });
        }
    }
}

async function updateDateFrom(id, changeVal, req, res){
    if (changeVal == "empty") {
        checkEmpty(req, res);
    } else {
        let resultFormat = moment(changeVal, ["YYYY-MM-DD", "YYYY-M-D"], true).isValid();
        if (resultFormat) {
            let resultBetweenFromTo = await checkBetweenDateWhenEditFrom (id, changeVal);
            if (resultBetweenFromTo == true) {
                Holiday.findByIdAndUpdate(id,{ from: changeVal },(err,doc) => {
                    if (!err) {
                        res.redirect('/holiday-management');
                    } else {
                        console.log('Error during update record : ' + err);
                    }
                });
            } else if ( resultBetweenFromTo == false ){
                exist(req, res);
            } else if ( resultBetweenFromTo == "from-greater-to" ){
                errGreaterSmaller(req, res, "", "", "", resultBetweenFromTo)
            } 
        } else {
            errorFormat(req, res);
        }
    }
}

async function updateDateTo(id, changeVal, req, res){
    if (changeVal == "empty") {
        checkEmpty(req, res);
    } else {
        let resultFormat = moment(changeVal, ["YYYY-MM-DD", "YYYY-M-D"], true).isValid();
        if (resultFormat) {
            let resultBetweenFromTo = await checkBetweenDateWhenEditTo (id, changeVal);
            if (resultBetweenFromTo == true) {
                Holiday.findByIdAndUpdate(id,{ to: changeVal },(err,doc) => {
                    if (!err) {
                        res.redirect('/holiday-management');
                    } else {
                        console.log('Error during update record : ' + err);
                    }
                });
            } else if ( resultBetweenFromTo == false ){
                exist(req, res);
            } else if ( resultBetweenFromTo == "to-smaller-from" ){
                errGreaterSmaller(req, res, "", "", "", resultBetweenFromTo)
            }
        } else {
            errorFormat(req, res);
        }
    }
}

async function findOneAndInsert(req, res, name = "", from = "", to = "") {

    let resultFormatFrom = moment(from, ["YYYY-MM-DD", "YYYY-M-D"], true).isValid();
    let resultFormatTo = moment(to, ["YYYY-MM-DD", "YYYY-M-D"], true).isValid();

    if (resultFormatFrom && resultFormatTo) {
        let rangeDay = {
            $gte: new Date(from),
            $lte: new Date(to)
        }

        let checkDateBetween = await checkBetweenDate(from, to);
        
        if (checkDateBetween == false) {
            exist(req, res, name, from, to);
        } else {
            Holiday.find().or([{"from" : rangeDay},{"to" : rangeDay},{"name":name}])
            .then(result => {
                if (result.length) {
                    exist(req, res, name, from, to)
                } else {
                    insertRecord(req, res);
                }
            })
            .catch(error => {
                console.log('Error!');
            })
        }
    } else {
        errorFormat(req,res);
    }
}

function insertRecord(req, res) {
	var holiday = new Holiday();

	holiday.name = req.body.name;
    holiday.from = req.body.from;
    holiday.to = req.body.to;
    
    holiday.save((err,doc) => {
        if (!err) {
            res.redirect('/holiday-management');
        } else {
            console.log('Error during record insertion : ' + err);
        }
    });
}

async function exist(req, res, name = "", from = "", to = "") {
    Holiday.find( (err,docs) => {
        if (!err) {
            res.render("holiday-management", {
                holiday : docs,
                email: req.user.email,
                role: req.user.role,
                name : name,
                from: from,
                to : to,
                textErr : textModal.errExist,
                errExist : 'exist',
                errSpecial : textModal.errSpecialCharacter
            });
        } else {
            console.log('Error load list page');
        }
    });
}

function errorFormat(req, res, name = "", from = "", to = "") {
    Holiday.find( (err,docs) => {
        if (!err) {
            res.render("holiday-management", {
                holiday : docs,
                errExist : 'empty',
                email: req.user.email,
                role: req.user.role,
                name : name,
                from: from,
                to : to,
                textErr : textModal.errFormatDate,
                errSpecial : textModal.errSpecialCharacter
            });
        } else {
            console.log('Error load list page');
        }
    });
}

async function checkBetweenDateWhenEditFrom(id, strDate){
    let date = new Date(strDate);
    let result;

    let holiday = await Holiday.findById(id, (err,docs) => {
        let toDB = new Date(docs.to);
        if (date > toDB) {
            result = "from-greater-to";
            return result;
        } else {
            result = true;
        }
    });

    if (date > holiday.from && date < holiday.to) {
        return true;
    } else {
        let rangeDay = {
            $gte: date,
            $lte: new Date(holiday.to)
        }
    
        if (result == true) {
            let arrFind = await Holiday.find({_id: {$ne: id}}).or([{"from" : rangeDay},{"to" : rangeDay}])
            if (arrFind.length > 0) {
                result = false;
            }
        }
    }
    return result;
}

async function checkBetweenDateWhenEditTo(id, strDate){
    let date = new Date(strDate);
    let result;

    let holiday = await Holiday.findById(id, (err,docs) => {
        let fromDB = new Date(docs.from);
        if (date < fromDB) {
            result = "to-smaller-from";
            return result;
        } else {
            result = true;
        }
    });

    if (date > holiday.from && date < holiday.to) {
        return true;
    } else {
        let rangeDay = {
            $gte: new Date(holiday.from),
            $lte: date
        }
    
        if (result == true) {
            let arrFind = await Holiday.find({_id: {$ne: id}}).or([{"from" : rangeDay},{"to" : rangeDay}])
            if (arrFind.length > 0) {
                result = false;
            }
        }
    }
    return result;
}

async function checkBetweenDate(from, to){
    let fromAdd = new Date(from);
    let toAdd = new Date(to);
    let result;

    let arrHoliday = await Holiday.find();
        
    for (let i=0; i < arrHoliday.length; i++) {
        let fromDB = new Date(arrHoliday[i].from);
        let toDB = new Date(arrHoliday[i].to);
        if ((fromAdd > fromDB && fromAdd < toDB) || (toAdd > fromDB && toAdd < toDB)) {
            result = false;
            break;
        } else {
            result =  true;
        }
            
    }
    return result;
}

function checkEmpty(req, res, name = "", from = "", to = "") {
    Holiday.find( (err,docs) => {
        if (!err) {
            res.render("holiday-management", {
                holiday : docs,
                errExist : 'empty',
                email: req.user.email,
                role: req.user.role,
                name : name,
                from: from,
                to : to,
                textErr : textModal.errAddEmpty,
                errSpecial : textModal.errSpecialCharacter
            });
        } else {
            console.log('Error load list page');
        }
    });
}

function errMinMaxLength(req, res, name = "", from = "", to = "", status){
    if (status == 'min') {
        var textErr = textModal.errMin;
    } else {
        var textErr = textModal.errMax;
    }
    Holiday.find( (err,docs) => {
        if (!err) {
            res.render("holiday-management", {
                holiday : docs,
                email: req.user.email,
                role: req.user.role,
                name : name,
                from: from,
                to : to,
                textErr : textErr,
                errExist : status,
                errSpecial : textModal.errSpecialCharacter
            });
        } else {
            console.log('Error load list page');
        }
    });
}

function errGreaterSmaller(req, res, name = "", from = "", to = "", status){
    if (status == 'from-greater-to') {
        var textErr = textModal.errFromGreaterTo;
    } else if (status == 'to-smaller-from') {
        var textErr = textModal.errToSmallerFrom;
    }
    Holiday.find( (err,docs) => {
        if (!err) {
            res.render("holiday-management", {
                holiday : docs,
                email: req.user.email,
                role: req.user.role,
                name : name,
                from: from,
                to : to,
                textErr : textErr,
                errExist : status,
                errSpecial : textModal.errSpecialCharacter
            });
        } else {
            console.log('Error load list page');
        }
    });
}

function findAll(req, res){
    Holiday.find((err,docs) => {
        if (!err) {
            res.render("holiday-management", {
                holiday : docs,
                email: req.user.email,
                role: req.user.role,
                errExist : 'normal',
                errSpecial : textModal.errSpecialCharacter
            });
        } else {
            console.log('Error load list page');
        }
    })
}

module.exports = router;
