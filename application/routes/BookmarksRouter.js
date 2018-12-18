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
        res.status(400).end('No bus stop provided');
        return;
    }
    let busStops = query['bus-stops'].split(',').filter(Boolean);

    let promises = [];
    let data = {};

    busStops.forEach(busStopCode => {
        promises.push(new Promise(resolve => {
            res.db.getCollection('bus stops').findDocument({busStopCode}, (err, busStop) => {
                if (busStop)
                    data[busStopCode] = busStop;
                resolve();
            });
        }))
    });

    Promise.all(promises).then(() => {
        res.render('bookmarks/render', {data});
    });
});

module.exports = router;
