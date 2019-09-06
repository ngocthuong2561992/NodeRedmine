const _ = require('lodash');

const logout = ({ apiProject }, { config }) => async (req, res) => {
	req.logout();
	res.redirect('/auth/login');
};

module.exports = { logout };
