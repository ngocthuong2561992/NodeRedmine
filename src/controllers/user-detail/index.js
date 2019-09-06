const express = require('express');
const _ = require('lodash');
const router = express.Router();
const moment = require('moment');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Issue = mongoose.model('issues');
const timeEntries = mongoose.model('timeEntries');
const Holiday = mongoose.model('holiday');
const Sync = require('../../lib/sync-data');

const lastSync = new Sync();

var firstname;
var lastname;
var idusername;
var arrRemove = [];
const today = moment().startOf('month');
var createdAt = {
    $gte: today.toDate(),
    $lte: moment(today).endOf('month').toDate()
}

// -------------------------------- Default Load Page -----------------------------------------------

router.get('/:id', async (req, res) => {
    let id = req.params.id;
    await findInfoDefault(id, req, res);
});

/**
  * @desc Show all data when go to user-detail page (not filter yet)
  * @param number id - id of user
  * @param object req -  is an object containing information about the HTTP request
  * @param object res - res to send back the desired HTTP response
*/
async function findInfoDefault(id, req, res) {
    await finduser(id);
    let arrAllTE = await findTEDefault(id);
    let issues = await findIssue(arrAllTE);
    let uniqueIssue = await sortIssue(issues);

    let allDaysOfMonth = await DifferenceInDays(createdAt.$gte, createdAt.$lte);
    let allSatSun = await getSatAndSun(createdAt.$lte, allDaysOfMonth)
    let month = createdAt.$lte.getMonth() + 1;
    let year = createdAt.$lte.getFullYear();

    let totalRealTime = await sumTotalRealTime(uniqueIssue, arrAllTE);
    let totalTime = await totalFunction("",allSatSun);
    let workload = (totalRealTime/totalTime)*100;
    let arrSum = [totalRealTime, totalTime, workload];

    await loadPage(req, res, uniqueIssue, arrAllTE, allDaysOfMonth, month, year, allSatSun, arrSum);
}

/**
  * @desc Find user in database by user id
  * @param number id - id of user
*/
async function finduser(id) {
    let data = await User.find({id: id})
    let listUser = data.map((user) => {
        firstname = user.firstname;
        lastname = user.lastname;
        idusername = user.id;
    })
}

/**
  * @desc load all data to user-detail page
  * @param object req -  is an object containing information about the HTTP request
  * @param object res - res to send back the desired HTTP response
  * @param array issues - all issues that user participate in
  * @param array listTE - all Time Entries that user participate in
  * @param number allDays - all days of current month
  * @param string month - Current month
  * @param string year - Current year
  * @param array arrSatSun - all saturday and sunday of current month
  * @param array arrSum - array include totalRealTime, totalTime, workload
*/
async function loadPage(req, res, issues, listTE, allDays, month, year, arrSatSun, arrSum) {
    let dateLastSync = await lastSync.getLastCompleteSync();
    let numMonth = Number(month);
    if (numMonth < 10) {
        month = '0'+ month;
    }
    res.render("user-detail", {
        email: req.user.email,
        role: req.user.role,
        listIssue: issues,
        listTE : listTE,
        firstname: firstname,
        lastname: lastname,
        idusername: idusername,
        allDays : allDays,
        month : month,
        year : year,
        arrSatSun : arrSatSun,
        totalRealTime : arrSum[0],
        totalTime : arrSum[1],
        workload : arrSum[2],
        lastSync : formatDate(dateLastSync,"YYYY-MM-DD HH:mm:ss")
    });
}

/**
  * @desc Find time entries of user by user id (not filter yet)
  * @param number id - id of user
*/
async function findTEDefault(id) {
    let data = await timeEntries.find( {"user.id":id,"spent_on":createdAt});
    return data;
}

/**
  * @desc Find issues of user by user id
  * @param array arrTE - all Time Entries that user participate in
  * @return arrIssue - array include all issue that user participate in
*/
async function findIssue(arrTE) {
    let arrIssue = [];
    let arrDay = [];
    for (let index = 0; index < arrTE.length; index++) {
        let idIssue = arrTE[index].issue.id;
        let data = await Issue.find( {"id":idIssue});
        let day = formatDate(arrTE[index].spent_on,"YYYY-MM-DD");
        if (data.length == 0) {
            let result = arrDay.includes(day);
            if (result == false) {
                arrRemove = arrRemove.concat(day);
            }
        } else {
            let dayRestore = arrRemove.indexOf(day);
            if (dayRestore > -1) {
                arrRemove.splice(dayRestore, 1);
            }
            arrDay = arrDay.concat(day);
        }
        arrIssue = arrIssue.concat(data);
    }
    return arrIssue;
}

/**
  * @desc Merge same issues
  * @param array arr - all issues
  * @return uniqueArray - array include issue merged
*/
async function sortIssue(arr) {
    const uniqueArray = arr.filter((thing,index) => {
        return index === arr.findIndex(obj => {
          return JSON.stringify(obj) === JSON.stringify(thing);
        });
    });
    return uniqueArray;
}

// -------------------------------- Filter Load Page -----------------------------------------------

router.get('/:id/:year/:month', async (req, res) => {
    let id = req.params.id;
    let month = req.params.month;
    let year = req.params.year;
    findInfoFilter(req , res, id, year, month);
});

/**
  * @desc Show all data to user-detail page when filter
  * @param object req -  is an object containing information about the HTTP request
  * @param object res - res to send back the desired HTTP response
  * @param number id - id of user
  * @param string year - year when user choose
  * @param string month - month when user choose
*/
async function findInfoFilter(req , res, id, year, month) {
    let allDaysOfMonth = await getDaysInMonth(year, month);
    let users = await finduser(id);

    let firstDayOfMonth = new Date(year + "-" + month + "-" + "01");
    let lastDayOfMonth = new Date(year + "-" + month + "-" + allDaysOfMonth);
    
    let allSatSun = await getSatAndSun(firstDayOfMonth,allDaysOfMonth);
    let arrAllTE = await findTEFilter(id, firstDayOfMonth, lastDayOfMonth);
    let issues = await findIssue(arrAllTE);
    let uniqueIssue = await sortIssue(issues);
    let totalRealTime = await sumTotalRealTime(uniqueIssue, arrAllTE);
    let totalTime = await totalFunction([year, month, firstDayOfMonth, lastDayOfMonth],allSatSun);
    let workload = (totalRealTime/totalTime)*100;
    let arrSum = [totalRealTime, totalTime, workload]
    await loadPageWhenFilter(req, res, uniqueIssue, arrAllTE, allDaysOfMonth, month, year, allSatSun, arrSum);
}

/**
  * @desc Find time entries of user by user id when filter
  * @param number id - id of user
  * @param date firstDay - first day of month that user chosen
  * @param date lastDay - last day of month that user chosen
  * @returns data - array of Time Entries that user participate in the month the user has chosen
*/
async function findTEFilter(id, firstDay, lastDay) {
    let data = await timeEntries.find( {"user.id":id,"spent_on": {
        $gte: firstDay,
        $lte: lastDay
    }});
    return data;
}

/**
  * @desc load all data to user-detail page when filter
  * @param object req -  is an object containing information about the HTTP request
  * @param object res - res to send back the desired HTTP response
  * @param array issues - all issues that user participate in
  * @param array listTE - all Time Entries that user participate in
  * @param number allDays - all days of current month
  * @param string month - Current month
  * @param string year - Current year
  * @param array arrSatSun - all saturday and sunday of current month
  * @param array arrSum - array include totalRealTime, totalTime, workload
*/
async function loadPageWhenFilter(req, res, issues, listTE, allDays, month, year, arrSatSun, arrSum) {
    let dateLastSync = await lastSync.getLastCompleteSync();
    res.render("user-detail", {
        year: year,
        month: month,
        email: req.user.email,
        role: req.user.role,
        listIssue: issues,
        listTE : listTE,
        firstname: firstname,
        lastname: lastname,
        idusername: idusername,
        allDays : allDays,
        arrSatSun : arrSatSun,
        totalRealTime : arrSum[0],
        totalTime : arrSum[1],
        workload : arrSum[2],
        lastSync : formatDate(dateLastSync,"YYYY-MM-DD HH:mm:ss")
    });
}

//---------------------------------- Function Support -----------------------------------------------

/**
  * @desc calculate total real time
  * @param array arrIssue - all issue that user paticipate in
  * @param array arrTE - all time entries that user paticipate in
  * @returns sum - total real time of user
*/
async function sumTotalRealTime(arrIssue, arrTE) {
    let sum = 0;
    for (let i = 0; i < arrIssue.length; i++) {
        let idIssue = arrIssue[i].id;
        for (let j = 0; j < arrTE.length; j++) {
            if (arrTE[j].issue.id == idIssue) {
                sum += arrTE[j].hours;
            }
        }
    }
    return sum;
}


/**
  * @desc Date format according to string is passed into the function
  * @param date date - date
  * @param string format - string, ex: "YYYY-MM-DD"
  * @returns date in format string, ex:"YYYY-MM-DD"
*/
function formatDate (date,format) {
    var mmnt = moment(date);
    return mmnt.format(format);
}

/**
  * @desc Calculate total Time base on all day of month, holiday of month, all Saturday and Sunday of month
  * @param array isFilter - to check if empty is default not filter and not empty is array include year, month, firstDayOfMonth, lastDayOfMonth
  * @param array allSatSun - array include all saturday and sunday
  * @returns result of total time
*/
async function totalFunction(isFilter,allSatSun) {
    var totalTime;
    if (!isFilter) {
        let startTime = moment(createdAt.$gte);
	    let endTime = moment(createdAt.$lte)
        let dayOff = await getDayOffInStage(startTime, endTime);
        let allDay = await DifferenceInDays(startTime, endTime);
        let arrHoliday = await Holiday.find().or([{"from": createdAt}, {"to": createdAt}])
        let holiday = await getHolidayExcludeSatSun(arrHoliday, allSatSun);
        totalTime = (allDay - dayOff - holiday) * 8;
    } else {
        let objDay = {
            $gte: isFilter[2],
            $lte: isFilter[3]
        }
        let startTime = moment(isFilter[2]);
        let endTime = moment(isFilter[3]);
        let dayOff = await getDayOffInStage(startTime, endTime);
        let allDay = await getDaysInMonth(isFilter[0], isFilter[1]);
        let arrHoliday = await Holiday.find().or([{"from": objDay}, {"to": objDay}])
        let holiday = await getHolidayExcludeSatSun(arrHoliday, allSatSun);
        totalTime = (allDay - dayOff - holiday) * 8;
    }
    return totalTime;
}

/**
  * @desc get holiday in holiday-management at month exclude saturday and sunday
  * @param array arrHolidayDB - all holiday of month in  holiday-management
  * @param array arrSatSun - array include all saturday and sunday
  * @returns number of holiday exclude saturday and sunday
*/
async function getHolidayExcludeSatSun(arrHolidayDB, arrSatSun) {
    let count = 0;
    if (arrHolidayDB.length > 0) {
        for (let i = 0; i < arrHolidayDB.length; i++) {
            let from = new Date(arrHolidayDB[i].from).getDate();
            let to = new Date(arrHolidayDB[i].to).getDate();
            for (let j = from; j <= to; j++) {
                let result = arrSatSun.includes(j);
                if (!result) {
                    count++;
                }
            }
        }
    }
    return count;
}

/**
  * @desc get all saturday and sunday in month , this function only use for funtion totalFunction
  * @param date startTime - start day of month
  * @param date endTime - end day of month
  * @returns array include all saturday and sunday of month
*/
async function getDayOffInStage(startTime, endTime) {
	let days = endTime.diff(startTime, 'd');
	let dayOff = 0;
	for (var i = 0; i<= days; i++) {
		let dayStart = startTime.clone();
		let nextDate = dayStart.add(i, 'd');
		let day = nextDate.day();
		if (day === 0 || day === 6) {
			dayOff++;
		}
    }
	return dayOff;
}

/**
  * @desc get all saturday and sunday in month , this function only use for funtion findInfoDefault and findInfoFilter
  * @param date day - start day of month
  * @param number getTot - all day of month
  * @returns array include all saturday and sunday of month
*/
async function getSatAndSun(day,getTot) {
    let daysOff = new Array();
    for (var i=1;i<=getTot;i++){
        var newDate = new Date(day.getFullYear(),day.getMonth(),i)
        if (newDate.getDay()==0){
            daysOff.push(i)
        }
        if (newDate.getDay()==6){
            daysOff.push(i)
        }
        
    }
    return daysOff;
}

/**
  * @desc get all days in month when not filter
  * @param date firstDate - start day of month
  * @param date secondDate - end day of month
  * @returns number all day of month
*/
async function DifferenceInDays(firstDate, secondDate) {
    return Math.round((secondDate-firstDate)/(1000*60*60*24));
}

/**
  * @desc get all days in month when filter
  * @param string year - year chosen
  * @param string month -month chosen
  * @returns number all day of month
*/
async function getDaysInMonth(year, month) {
   return new Date(year, month, 0).getDate();
};

module.exports = router;
