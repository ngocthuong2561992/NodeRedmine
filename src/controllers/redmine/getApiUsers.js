const _ = require('lodash');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const UserTemp = mongoose.model('UserTemp');

// const getApiUsers = ({ apiUser }, { config }) => async (req, res, next) => {
//   var _apiUser = new apiUser();
//   _apiUser.getAll(function(data) {
//     console.log('BODY: ' + data);
//     res.status(200).send(data);
//   });
	
// };

const getApiUsers = ({ apiProject }) => async (req, res, next) => {

    var arr = [];
    var maxLimit = 100;
    var offset = 0;
    var offsetLimit = 1000;

    new Promise((resolve, reject) => {
		var _apiProject = new apiProject();

		User.deleteMany({}, function(err) { 
			console.log('User documents removed');
		});

		UserTemp.deleteMany({}, function(err) { 
			console.log('UserTemp documents removed');
		});

		for (var i = 0; i < offsetLimit/100; i++) {
			(function (i) {
				setTimeout(function () {
					_apiProject.getUsers(maxLimit,offset,function(data) {
						if (isEmpty(data.users[0]) != true) {
							
                            let arr = [];
                            console.log(offset);

							let users = data.users;
							arr.push(users);
							
							offset += 100;
							for (var a = 0; a < arr[0].length; a++) {
								// insert to collection user
								var usersObj = new User();
                                usersObj.id = arr[0][a].id;
                                usersObj.login = arr[0][a].login;
                                usersObj.firstname = arr[0][a].firstname;
                                usersObj.lastname = arr[0][a].lastname;
                                usersObj.mail = arr[0][a].mail;
                                usersObj.created_on = arr[0][a].created_on;
                                usersObj.last_login_on = arr[0][a].last_login_on;
                                usersObj.save((err,doc) => { });
							}

							for (var b = 0; b < arr[0].length; b++) {
								// insert to collection userTemp
								let userObjTemp = new UserTemp();
								userObjTemp.id = arr[0][b].id;
                                userObjTemp.login = arr[0][b].login;
                                userObjTemp.firstname = arr[0][b].firstname;
                                userObjTemp.lastname = arr[0][b].lastname;
                                userObjTemp.mail = arr[0][b].mail;
                                userObjTemp.created_on = arr[0][b].created_on;
                                userObjTemp.last_login_on = arr[0][b].last_login_on;
                                userObjTemp.save((err,doc) => { });
							}
						} else {
                            resolve();
						}
                    })
                }, 5000*i);
            })(i);
        }
		//resolve();
	}).then(() => {
		res.status(200).send({ res: "OK" });
	})
    
};

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports= { getApiUsers };
