var syncDataID = 0;

function btnRefresh() {
	$('.btn-sync').on('click', function() {
		$('#syncDataModal').modal();
	});
	$('.btn-confirm-sync').click(function () {
		$('#syncDataModal').modal('hide');
		var url = "/syncDataTimeEntries/createRunSyncData";
		$.ajax({
			url: url,
			data: {},
			contentType: "application/json",
			error: function() {
			},
			dataType: 'json',
			success: function(data) {
				syncDataID = data._id;
				syncDataRedmine();
			},
			type: 'GET'
		});
	});
}btnRefresh();

function syncDataRedmine() {
	$('.loading').css('display','block');
	this.disabled = true;
	saveUsers();
	saveProjects();

	$('*').click(function(event) {
		if (this === event.target) {
			var retVal = confirm("Do you want to stop ?");
			if( retVal == true ) {
				console.log('Stop request');
				$(window).unbind('beforeunload');
				let currentURL = window.location.href;
				window.location.href = currentURL;
			}
		}
	});

	$(window).bind('beforeunload', function() {
		return 'Are you sure you want to leave?';
	});
}

////------------- User ---------------///////////////////////////////////////////////////////////////////
function saveUsers() {
	var url = "/redmine/getApiUsers";
	$.ajax({
		url: url,
		data: {},
		contentType: "application/json",
		error: function() {
		},
		dataType: 'json',
		success: function(data) {
			console.log('save User successfully');
		},
		type: 'GET'
	});
}

////------------- Project ---------------///////////////////////////////////////////////////////////////////
function saveProjects() {
	var url = "/redmine/getApiProjects";
	$.ajax({
		url: url,
		data: {},
		contentType: "application/json",
		error: function() {
		},
		dataType: 'json',
		success: function(data) {
			console.log('save Project successfully');
			/// +++ Sync News +++ ///
			saveNews();
			/// +++ Sync News +++ ///
			/// +++ Sync Project Membership +++ ///
			saveProjectMembership();
			/// +++ Sync Project Membership +++ ///
			/// +++ Sync Isses +++ ///
			saveIssues();
			/// +++ Sync Isses +++ ///
		},
		type: 'GET'
	});
}

////------------- Time Entries ---------------///////////////////////////////////////////////////////////////////
var count = 0;
var total_For = 0;

function getCurrentDate() {
	var date = new Date();
	var year = date.getFullYear();
	var month = ((date.getMonth() + 1) < 10)?('0' + (date.getMonth() + 1)):(date.getMonth() + 1);
	var day = (date.getDate() < 10)?('0' + date.getDate()):date.getDate();
	var currentDate = year + '-' + month + '-' + day;
	return currentDate;
}

function saveTimeEntries() {
	if (total_For !== 0 || count !== 0) {
		return;
	}
	setTimeAddCollection();
	var url = "/syncDataTimeEntries/getApiTimeEntries";
	$.ajax({
		url: url,
		data: {},
		contentType: "application/json",
		error: function() {
		},
		dataType: 'json',
		success: function(data) {
			getAllDataJson(data.total_count);
		},
		type: 'GET'
	});
}

function getAllDataJson(totalCount) {
	var url = "/syncDataTimeEntries/timeEntries";
	var currentDate = getCurrentDate();
	var data = {
		from: '2013-01-01',
		to: currentDate,
		offset: 0
	};
	var offset = 100;
	var length = totalCount/offset;
	var intLenght = parseInt(length);
	if (intLenght < length) {
		intLenght = intLenght + 1;
	}
	total_For = intLenght;
	for (var i = 0; i < intLenght; i++) {
		var option = data;
		option.offset = i * 100;
		$.ajax({
			url: url,
			data: option,
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				count = count + 1;
				console.log(errorThrown);
			},
			dataType: 'text',
			success: function(data) {
				count = count + 1;
				console.log(data + ' time entries');
			},
			type: 'GET'
		});
	}
}

function saveTimeEntriesMain() {
	var url = "/syncDataTimeEntries/saveMongoTimeEntries";
	$.ajax({
		url: url,
		data: {
			syncID: syncDataID
		},
		error: function() {
		},
		dataType: 'text',
		success: function(data) {
			console.log(data);
			$(window).unbind('beforeunload');
			let currentURL = window.location.href;
			window.location.href = currentURL;
		},
		type: 'GET'
	});
}

function setTimeAddCollection() {
	var interval_obj = setInterval(function(){
		if (total_For === count && total_For !== 0 && count !== 0) {
			saveTimeEntriesMain();
			total_For = 0;
			count = 0;
			clearInterval(interval_obj);
		}
	}, 10000);
}

////////////-------------- Issues ------------ Issues ---------------- Issues -------------------------
var countIssues = 0;
var total_ForIssues = 0;

function saveIssues() {
	if (total_ForIssues !== 0 || countIssues !== 0) {
		return;
	}
	setTimeAddCollection_V2();
	var url = "/syncDataIssues/getApiIssues";
	$.ajax({
		url: url,
		data: {},
		contentType: "application/json",
		error: function() {
		},
		dataType: 'json',
		success: function(data) {
			getAllDataJsonIssues(data.total_count);
		},
		type: 'GET'
	});
}

function getAllDataJsonIssues(totalCount) {
	var url = "/syncDataIssues/issues";
	var data = {
		offset: 0
	};
	var offset = 100;
	var length = totalCount/offset;
	var intLenght = parseInt(length);
	if (intLenght < length) {
		intLenght = intLenght + 1;
	}
	total_ForIssues = intLenght;
	for (var i = 0; i < intLenght; i++) {
		var option = data;
		option.offset = i * 100;
		$.ajax({
			url: url,
			data: option,
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				countIssues = countIssues + 1;
				console.log(errorThrown);
			},
			dataType: 'text',
			success: function(data) {
				countIssues = countIssues + 1;
				console.log(data + ' issues');
			},
			type: 'GET'
		});
	}
}

function saveIssuesMain() {
	var url = "/syncDataIssues/saveMongoIssues";
	$.ajax({
		url: url,
		data: {},
		error: function() {
		},
		dataType: 'text',
		success: function(data) {
			console.log(data);
			/// +++ Sync Time Entries +++ ///
			saveTimeEntries();
			/// +++ Sync Time Entries +++ ///
		},
		type: 'GET'
	});
}

function setTimeAddCollection_V2() {
	var interval_obj_v2 = setInterval(function(){
		if (total_ForIssues === countIssues && total_ForIssues !== 0 && countIssues !== 0) {
			saveIssuesMain();
			total_ForIssues = 0;
			countIssues = 0;
			clearInterval(interval_obj_v2);
		}
	}, 10000);
}

////////////-------------- News ------------ News ---------------- News -------------------------
function saveNews() {
	var url = "/syncDataNews/syncDataNews";
	$.ajax({
		url: url,
		data: {},
		contentType: "text",
		error: function() {
		},
		dataType: 'text',
		success: function(data) {
			console.log('save New successfully');
		},
		type: 'GET'
	});
}

////////////-------------- project membership ------------ project membership ---------------- project membership -------------------------
function saveProjectMembership() {
	var url = "/syncDataMembership/syncDataMembership";
	$.ajax({
		url: url,
		data: {},
		contentType: "text",
		error: function() {
		},
		dataType: 'text',
		success: function(data) {
			console.log('save Project Membership successfully');
		},
		type: 'GET'
	});
}