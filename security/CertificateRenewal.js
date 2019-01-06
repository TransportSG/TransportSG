const childProcess = require('child_process');
const HTTPSServer = require('../server/HTTPSServer');

const config = require('../config.json');

setInterval(() => {
    console.log('renewing certs')
    childProcess.exec('certbot renew', () => {
        console.log(arguments);
        HTTPSServer.createSecureContext(config.sslCertPath);
    });
}, 1000 * 60 * 60 * 12);
