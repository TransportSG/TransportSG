const express = require('express');

module.exports = class MainServer {

    constructor() {
        this.app = express();
        this.configMiddleware();
        this.configRoutes();
    }

    configMiddleware() {

    }

    configRoutes() {
        this.app.use((req, res) => {
            res.end('Hello world');
        });
    }

}
