const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');
const minify = require('express-minify');
const url = require('url');
const fs = require('fs');

const DatabaseConnection = require('../application/database/DatabaseConnection');

const config = require('../config.json');

// const OldTSG = require('../OldTSG/index.js');

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
            let reqURL = req.url + '';
            let start = +new Date();

            let endResponse = res.end;
            res.end = function(x, y, z) {
                endResponse.bind(res, x, y, z)();
                let end = +new Date();

                let diff = end - start;

                if (diff > 5 && !reqURL.startsWith('/static/'))
                    stream.write(req.method + ' ' + reqURL + (res.loggingData ? ' ' + res.loggingData : '') + ' ' + diff + '\n', () => {});
            };

            res.locals.hostname = config.websiteDNSName;

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
            let secureDomain = `http${config.useHTTPS ? 's' : ''}://${config.websiteDNSName}:*`;
            secureDomain += ` http${config.useHTTPS ? 's' : ''}://static.${config.websiteDNSName}:*`
            secureDomain += ` http${config.useHTTPS ? 's' : ''}://static.transportsg.me:*`
            secureDomain += ` http${config.useHTTPS ? 's' : ''}://bus.${config.websiteDNSName}:*`

            res.setHeader('Content-Security-Policy', `default-src ${secureDomain}; script-src 'unsafe-inline' ${secureDomain}; style-src 'unsafe-inline' ${secureDomain}`);
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            res.setHeader('X-Xss-Protection', '1; mode=block');
            res.setHeader('X-Content-Type-Options', 'nosniff');

            res.setHeader('Referrer-Policy', 'no-referrer');
            res.setHeader('Feature-Policy', "geolocation 'self'; document-write 'none'; microphone 'none'; camera 'none';");

            next();
        });

        app.set('views', path.join(__dirname, '../application/views'));
        app.set('view engine', 'pug');
        if (process.env['NODE_ENV'] && process.env['NODE_ENV'] === 'prod')
            app.set('view cache', true);
        app.set('x-powered-by', false);
        app.set('strict routing', false);
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
            MRTDisruptions: '/mrt/disruptions',
            'platdisplays/PlatformDisplay': '/platform-displays'
        };

        app.use('/', (req, res, next) => {
            let host = req.hostname || req.headers.host;

            if (host === 'bus.' + config.websiteDNSName) {
                req.url = path.join('/lookup', req.url);
            }
            next();
        });

        Object.keys(routers).forEach(routerName => {
            let router = require(`../application/routes/${routerName}Router`);
            app.use(routers[routerName], router);
        });

        // app.use('/old', OldTSG);
        app.use('/api', require('../application/routes/api'));

        app.get('/sw.js', (req, res) => {
            res.setHeader('Cache-Control', 'no-cache');
            res.sendFile(path.join(__dirname, '../application/static/sw.js'));
        });
    }

}
