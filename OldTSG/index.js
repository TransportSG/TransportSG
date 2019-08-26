const fs = require('fs'),
path = require('path'),
express = require('express'),
mongoose = require('mongoose'),
https = require('https'),
http = require('http'),
url = require('url'),
initApp = require('./init');

mongoose.Promise = global.Promise;

const   config = require('./config'),
configRoutes = require('./app/routes'),
configExpress = require('./app/express');

const port = config.port || 80,
app = express();
initApp(app);

function createHTTPSServer(app) {
  return https.createServer({
    key: fs.readFileSync(__dirname + '/https/privkey.pem'),
    cert: fs.readFileSync(__dirname + '/https/cert.pem'),
    ca: fs.readFileSync(__dirname + '/https/chain.pem')
  }, app);
}

function createRedirectServer(toURL) {
  return http.createServer((req, res) => {
    res.writeHead(302, {
      Location: toURL + url.parse(req.url).pathname
    });
    res.end();
  });
}

function connect() {
  return mongoose.connect(config.database, {
    native_parser: true,
    keepAlive: 300000,
    reconnectTries: 10,
    promiseLibrary: global.Promise
  });
}

connect();

configExpress(app);
configRoutes(app);

module.exports = app;
