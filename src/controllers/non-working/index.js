const express = require('express');
const moment = require('moment');
const sendMail = require('./send-mail')

var nonWorkingController = (models, config) => {
	let router = express.Router();

	router.get('/', (req, res) => {
		res.render("non-working", {
			email: req.user.email,
			role: req.user.role
		});
	});

	return router;
};

var replyMailController = (models, config) => {
	let router = express.Router();

	router.get('/:tokenID/:status', (req, res) => {
		let tokenID = req.params.tokenID;

	});

	return router;
};

module.exports = { nonWorkingController, replyMailController };