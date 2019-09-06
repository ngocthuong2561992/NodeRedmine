const express = require('express');

const routerLogin = function (passport) {
	var router = express.Router();

	router.get('/login', checklogin, passport.authenticate('google', { scope: ['profile', 'email'] }));

	router.get('/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }), redirectSuccess);

	return router;
};

function redirectSuccess(req, res) {
	if (req.user.islogin === false) {
		req.logOut();
		req.session.loginMessenger = "This account does not exist in the system";
		res.redirect('/auth/login');
	}
	else {
		if (req.user.role === 'admin' || req.user.role === 'pm')
		{
			res.redirect('/workload');
		}
		else {
			res.redirect('/non-working');
		}
	}
}

function checklogin(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	else if (req.user.role === 'admin' || req.user.role === 'pm')
	{
		res.redirect('/workload');
	}
	else {
		res.redirect('/non-working');
	}
}

module.exports = routerLogin;
