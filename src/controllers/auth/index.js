const { Router: router } = require('express');

const { login } = require('./login');
const { logout } = require('./logout');

module.exports = (models, { config }) => {
	const api = router();

	api.get('/login', login(models, { config }));
	api.get('/logout', logout(models, { config }));

	return api;
};
