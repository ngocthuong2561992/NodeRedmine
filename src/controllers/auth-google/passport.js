const {Employee} = require('../../models/employee');

/**
  * @desc login google
  * @param string config - config.js
  * @return passport - module nodejs passport
*/
const auth = config => {
	const passport = require('passport');
	const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

	passport.serializeUser(function (user, done) {
		done(null, user);
	});

	passport.deserializeUser(function (user, done) {
		return done(null, user);
	});

	passport.use(new GoogleStrategy({
		clientID: config.googleAuth.clientID,
		clientSecret: config.googleAuth.clientSecret,
		callbackURL: config.googleAuth.callbackURL
	},
		function (accessToken, refreshToken, profile, done) {
			process.nextTick(async () => {
				let query = {
					gsuit: profile.emails[0].value
				};
				let user = await Employee.findOne(query).catch(err => null);
				if (user !== null) {
					let output = {
						islogin: true,
						name: user.name,
						email: user.gsuit,
						role: user.role
					};
					return done(null, output);
				}
				else if (profile._json.domain === 'gigei.jp') {
					let employ = new Employee();
					employ.name = profile.displayName;
					employ.gsuit = profile.emails[0].value;
					employ.role = 'user';
					let newUser = await employ.save();
					let output = {
						islogin: true,
						name: newUser.name,
						email: newUser.gsuit,
						role: newUser.role
					};
					return done(null, output);
				}
				else {
					let output = {
						islogin: false
					};
					return done(null, output);
				}
			});
		}
	));

	return passport;
}

module.exports = auth;
