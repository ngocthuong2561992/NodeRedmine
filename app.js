const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const config = require('./config');
const { MongoManager } = require('./src/mongo');
const api = require('./src/api');
const exphbs = require('express-handlebars');
const bodyparser = require('body-parser');
const passport = require('./src/controllers/auth-google/passport')(config);
const googleAuth = require('./src/controllers/auth-google/router');
const session = require('express-session');
const handlebars_helpers = require('./src/lib/handlebars-helpers');

const app = express();
const mongoManager = new MongoManager(config);

app.use(bodyparser.urlencoded({
	extended: true
}));
app.use(bodyparser.json());

// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.engine('hbs', exphbs({
	extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/',
	partialsDir: __dirname + '/views/patials',
	helpers: handlebars_helpers
}));
app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
mongoManager.connect();

app.use(session({ secret: 'anystringoftext', saveUninitialized: true, resave: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/google-auth', googleAuth(passport));

app.use('/', api(config));

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

//page 404
app.use((req, res, next) => {
	res.status(404).render('404', {
		layout: false
	});
});

module.exports = app;
