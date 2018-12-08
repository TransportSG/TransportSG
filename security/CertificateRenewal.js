const childProcess = require('child_process');
const HTTPSServer = require('../server/HTTPSServer');

const config = require('../config');

setInterval(() => {
    childProcess.exec('certbot renew', () => {
        HTTPSServer.createSecureContext(config.sslCertPath);
    });
}, 1000 * 60 * 60 * 12);
