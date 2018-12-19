const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');

const DatabaseConnection = require('../application/database/DatabaseConnection');

const config = require('../config');

module.exports = class MainServer {

    constructor() {
        this.app = express();
        this.initDatabaseConnection(this.app, () => {
            this.configMiddleware(this.app);
            this.configRoutes(this.app);
        });
    }

    initDatabaseConnection(app, callback) {
        let database = new DatabaseConnection(config.databaseURL, 'TransportSG');
        database.connect((err) => {
            database.createCollection('bus services');
            database.createCollection('bus stops');
            database.createCollection('bus registrations');

            app.use((req, res, next) => {
                res.db = database;
                next();
            });

            callback();
        });
    }

    configMiddleware(app) {
        app.use(compression());

    	app.use('/static', express.static(path.join(__dirname, '../application/static')));

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(bodyParser.text());

        app.set('views', path.join(__dirname, '../application/views'));
        app.set('view engine', 'pug');
    }

    configRoutes(app) {
        let routers = {
            Index: '/',
            MRTTimings: '/timings/mrt',
            BusTimings: '/timings',
            BusLookup: '/lookup',
            NearbyObjects: '/nearby',
            GeneralSearch: '/search',
            Bookmarks: '/bookmarks',
            BusRouteInfo: '/bus'
        };

        Object.keys(routers).forEach(routerName => {
            let router = require(`../application/routes/${routerName}Router`);
            app.use(routers[routerName], router);
        });
    }

}
