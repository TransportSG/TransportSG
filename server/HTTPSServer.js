const https = require('https');
const tls = require('tls');
const fs = require('fs');
const path = require('path');

let secureContext = null;

module.exports = {

    createSecureContext: certPath => {
        let sslCertPath = path.join(certPath, 'cert.pem'),
            sslKeyPath = path.join(certPath, 'privkey.pem');

        let context = tls.createSecureContext({
            cert: fs.readFileSync(sslCertPath),
            key: fs.readFileSync(sslKeyPath)
        });

        secureContext = context;
    },

    getSecureContext: () => {
        return secureContext
    },

    createSNICallback: () => {
        return (servername, callback) => {
            callback(null, this.getSecureContext());
        };
    },

    createServer: (app, certPath) => {
        createSecureContext(certPath);

        return https.createServer({
            SNICallback: this.createSNICallback()
        }, app);
    }

};
