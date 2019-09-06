const nodemailer = require('nodemailer');
const EmailTemplate = require('email-templates');

class sendMail {
	constructor (models, config) {
		this.NonWorking = models.NonWorking;
		this.transporter = nodemailer.createTransport(config.mailConfig);
	}

	async getTemplate (data) {
		let template = new EmailTemplate();
		let templates = await template.render('../views/non-working/mail-day-off.hbs', data);
		console.log(templates);
		return templates;
	}

	async send() {
		return await this.transporter.sendMail(this.mailTemplate);
	}

	async testSendMail() {
		let mailTemplate = {
			from: config.mailConfig.auth.user,
			to: '',
			cc: '',
			subject: '',
			text: '',
			html: ''
		}
		mailTemplate.to = 'thaipt@rakumo.vn';
		mailTemplate.subject = 'Test cái choi';
		mailTemplate.html = await this.getTemplate({name: 'Phan Thanh Thai'});
		this.send();
	}

	async checkMailAndUpdateStatus(tokenID) {
		let data = await this.NonWorking.findOne()
	}

}

module.exports = sendMail;

///https://mail.google.com/mail/u/0/#settings/fwdandpop ( on IMAP )
///https://myaccount.google.com/u/0/lesssecureapps?rfn=27&rfnc=1&eid=5801632083896728720&et=0&asae=2&pli=1&pageId=none (on)