module.exports = {
	MONGODB_URI: 'mongodb://localhost:27017/nodejsredmine',
	redmine_url: 'rel.rakumo.vn',
	redmine_api: '3124819cd6e83a3ae3a09a9af498048d99cfd9fe',
	redmine_port: '443',
	redmine_folder: 'redmine',
	googleAuth: {
		clientID: '120758175362-sd8513mds8u56q2jm1ajhn5vdq260m1n.apps.googleusercontent.com',
		clientSecret: '-wR0JfSPW5pAHqu-F7Pd1fat',
		callbackURL: 'http://localhost:3000/google-auth/callback'
	},
	mailConfig: {
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: 'phan.thai@gigei.jp',
			pass: 'Accel759852'
		}
	}
};
