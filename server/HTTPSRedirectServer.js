const url = require('url');
const path = require('path');
const config = require('../config');

module.exports = class HTTPSRedirectServer {

    constructor() {
        this.httpsURL = `https://${config.websiteDNSName}`;
    }

    resolveHTTPSUrl(httpURL) {
        let parsedURL = url.parse(httpURL);

        return `${this.httpsURL}${parsedURL.path}`;
    }

    request(req, res) {
        let redirectedURL = this.resolveHTTPSUrl(req.url);

        res.writeHead(308, {Location: redirectedURL});
        res.end();
    }

}
