const moment = require('moment');

const helpers = {
	ifCheckRole: (roleCheck, myRole, options) => {
		if (myRole === roleCheck) {
			return options.fn(this);
		}
		return options.inverse(this);
	},
	math: function(lvalue, operator, rvalue) {
		lvalue = parseFloat(lvalue);
		rvalue = parseFloat(rvalue);
		return {
			"+": lvalue + rvalue,
			"-": lvalue - rvalue,
			"*": lvalue * rvalue,
			"/": lvalue / rvalue,
			"%": lvalue % rvalue
		}[operator];
	},
	ifNotEquals: function(arg1, arg2, options) {
		return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
	},
	ifEquals: function(arg1, arg2, options) {
		return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
	},
	getSumTEUserDetail: function(day, timeEntries, idIssue) {
		let sum = 0;
		for(let d = 1; d <= day; d++) {
			for(let i = 0; i < timeEntries.length; i++) {
				var date = formatDate(timeEntries[i].spent_on,"YYYY-MM-DD");
				let strDayTE = date.slice(-2);
				let numDayTE = Number(strDayTE);
				if (d == numDayTE && idIssue == timeEntries[i].issue.id) {
					sum += timeEntries[i].hours;
				}
			}
		}
		return convert(sum);
	},
	forLoopDayOfMonthUserDetail: function(from, to, incr, block) {
		var accum = '';
		for(var i = from; i <= to; i += incr) {
			accum += block.fn(i);
		}
		return accum;
	},
	setColorSatSunUserDetail: function(day ,arrSatSun, options) {
		let result = arrSatSun.includes(day);
		if (result == true) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	},
	setColorWorkload: function(workload) {
		if (workload < 50) {
			return "wl-available";
		} else if (workload >= 50 && workload <= 100) {
			return "wl-normal";
		} else if (workload >= 100) {
			return "wl-overload";
		}
	},
	setHourUserDetail: function(idIssue ,day, timeEntries) {
		let numDay = Number(day);
		let sum = 0;
		for (let i = 0; i < timeEntries.length; i++) {
			var date = formatDate(timeEntries[i].spent_on,"YYYY-MM-DD");
			let strDayTE = date.slice(-2);
			let numDayTE = Number(strDayTE);
			if (numDay == numDayTE && idIssue == timeEntries[i].issue.id) {
				sum += timeEntries[i].hours;
			}
		}
		if (sum == 0) {
			return "";
		}
		return convert(sum);
	},
	convert: function(numberA) {
		var numberB = parseInt(numberA);
		var numberC = numberA - numberB;
		if(numberC >= 0.60 && numberA != numberB )
		{
			numberC = numberC - 0.60;
			numberA = numberB + numberC + 1;
		}
		if(numberA === parseInt(numberA))
		{
			return (numberA + '.00');
		}
		return numberA.toFixed(1);
	},
	formatDate: function(date, format) {
		var mmnt = moment(date);
		return mmnt.format(format);
	},
};

function formatDate(date, format) {
	var mmnt = moment(date);
	return mmnt.format(format);
}

function convert(numberA) {
	var numberB = parseInt(numberA);
	var numberC = numberA - numberB;
	if(numberC >= 0.60 && numberA != numberB )
	{
		numberC = numberC - 0.60;
		numberA = numberB + numberC + 1;
	}
	if(numberA === parseInt(numberA))
	{
		return (numberA + '.00');
	}
	return numberA.toFixed(1);
}

module.exports = helpers;
