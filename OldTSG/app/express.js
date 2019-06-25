const express = require('express'),
	expressSession = require('express-session'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	cors = require('cors'),
	MongoStore = require('connect-mongo')(expressSession),
	flash = require('connect-flash'),
        initDBs = require('./init-dbs');

const	config = require('../config.js'),
	path = require('path'),
	env = process.env.NODE_ENV || 'development';

module.exports = app => {
    app.use(cors({
	origin: [`http://localhost${config.port ? `:${config.port}` : ''}`],
	optionsSuccessStatus: 200,
	credentials: true
    }));

    app.use('/static', express.static(path.join(__dirname, '../public')));

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());

    app.use(expressSession({
	resave: false,
	saveUninitialized: true,
	secret: 'keyboard kat',
	store: new MongoStore({
	    url: config.database,
	    collection: 'sessions'
	})
    }));

    app.use((req, res, next) => {
	if (req.session.user) {
	    res.locals.user = req.session.user;
	}
	next();
    });

    app.set('views', path.join(__dirname, '../app/views'));
    app.set('view engine', 'pug');

    app.use(flash());

};
