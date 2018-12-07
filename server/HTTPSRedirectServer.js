const url = require('url');
const path = require('path');
const fs = require('fs');
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
        if (req.url.startsWith('/.well-known')) {
            let filePath = path.join(config.webrootPath, req.url.path);

            fs.createReadStream(filePath).pipe(res);

            return;
        }

        let redirectedURL = this.resolveHTTPSUrl(req.url);

        res.writeHead(308, {Location: redirectedURL});
        res.end();
    }

}
