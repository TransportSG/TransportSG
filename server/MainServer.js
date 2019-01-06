const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');
const minify = require('express-minify');
const url = require('url');
const fs = require('fs');

const DatabaseConnection = require('../application/database/DatabaseConnection');

const config = require('../config.json');

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
            database.createCollection('bus services').createIndex({ serviceNumber: 1 });
            database.createCollection('bus stops').createIndex({ position: "2dsphere", busStopCode: 1 });
            database.createCollection('bus registrations').createIndex({ 'registration.number': 1 });

            app.use((req, res, next) => {
                res.db = database;
                next();
            });

            callback();
        });
    }

    configMiddleware(app) {
        let id = 0;
        let stream = fs.createWriteStream('/tmp/log.txt', {flags: 'a'});

        app.use((req, res, next) => {
            let start = +new Date();

            let endResponse = res.end;
            res.end = function(x, y, z) {
                endResponse.bind(res, x, y, z)();
                let end = +new Date();

                let diff = end - start;
                if (diff > 5)
                    stream.write(req.url + ' ' + diff + '\n', () => {});
            };

            next();
        });

        app.use(compression());
        app.use(minify());

        app.use('/static', express.static(path.join(__dirname, '../application/static')));

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(bodyParser.text());

        app.use((req, res, next) => {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000');
            if (config.useHTTPS && config.hpkp) {
                res.setHeader('Public-Key-Pins', `pin-sha256="${config.hpkp}"; max-age=5184000; includeSubDomains;`);
            }

            next();
        });

        app.set('views', path.join(__dirname, '../application/views'));
        app.set('view engine', 'pug');
        if (process.env['NODE_ENV'] && process.env['NODE_ENV'] === 'prod')
            app.set('view cache', true);
        app.set('x-powered-by', false);
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
            BusRouteInfo: '/bus',
            MRTDisruptions: '/mrt/disruptions'
        };

        Object.keys(routers).forEach(routerName => {
            let router = require(`../application/routes/${routerName}Router`);
            app.use(routers[routerName], router);
        });

        app.use('/api', require('../application/routes/api'));

        app.get('/sw.js', (req, res) => {
            res.sendFile(path.join(__dirname, '../application/static/sw.js'))
        });
    }

}
