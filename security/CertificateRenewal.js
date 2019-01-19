const childProcess = require('child_process');
const HTTPSServer = require('../server/HTTPSServer');

const config = require('../config.json');

setInterval(() => {
    console.error(new Date(), 'renewing certs')
    childProcess.exec('certbot renew', function(err, stdout, stderr) {
        console.log(stdout);
        console.error(stderr);
        HTTPSServer.createSecureContext(config.sslCertPath);
    });
}, 1000 * 60 * 60 * 12);
