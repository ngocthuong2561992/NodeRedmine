const _ = require('lodash');

const login = ({ apiProject }, { config }) => async (req, res, next) => {
	let messenger = '';
	if (req.session.loginMessenger) {
		messenger = req.session.loginMessenger;
		delete req.session.loginMessenger;
	}
	res.render('auth/login', {
		messenger: messenger,
		layout: 'auth/layout',
		title: 'Login'
	});
};

module.exports = { login };
