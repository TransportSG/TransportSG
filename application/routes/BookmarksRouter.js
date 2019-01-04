let express = require('express');
let router = new express.Router();
let queryString = require('querystring');
let url = require('url');

router.get('/', (req, res) => {
    res.render('bookmarks/index');
});

router.get('/render', (req, res) => {
    let query = queryString.parse(url.parse(req.url).query);

    if (!query['bus-stops']) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(`<div id="no-bookmarks"><span>Nothing appears to be bookmarked!</span></div>`);
        return;
    }
    let givenBusStops = query['bus-stops'].split(',').filter(Boolean);

    let promises = [];
    let busStops = [];

    givenBusStops.forEach(busStopCode => {
        promises.push(new Promise(resolve => {
            res.db.getCollection('bus stops').findDocument({busStopCode}, (err, busStop) => {
                if (busStop)
                    busStops.push(busStop);
                resolve();
            });
        }))
    });

    Promise.all(promises).then(() => {
        res.render('search/results', {busStops, busServices: [], mrtStations: []});
    });
});

module.exports = router;
