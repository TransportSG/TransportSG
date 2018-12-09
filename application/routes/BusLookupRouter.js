let express = require('express');
let router = new express.Router();

let operatorCss = {
    'Go Ahead Singapore': 'gas',
    'SBS Transit': 'sbst',
    'Singapore Bus Services': 'sbs',
    'Tower Transit Singapore': 'tts',
    'LTA Storage': 'lta',
    'Trans Island Buses': 'tibs',
    'SMRT Buses': 'smrt'
};

router.get('/', (req, res) => {
    res.render('bus/lookup');
});

router.post('/', (req, res) => {
    let query = req.body.query;
    let method = req.body.method;

    if (method === 'rego') {
        searchRego(req, res, query * 1);
    } else {
        res.status(400).end('Invalid method');
    }
});

function searchRego(req, res, number) {
    let buses = res.db.getCollection('bus registrations');

    buses.findDocuments({
        'registration.number': number
    }).toArray((err, buses) => {
        renderBuses(req, res, buses);
    });
}

function renderBuses(req, res, buses) {
    // buses = buses.map(bus => {
    //     let deregDate = bus.busData.deregDate;
    //     if (!deregDate) return bus;
    //
    //     let difference = deregDate - new Date();
    //
    //     if (difference > 0) { // bus still alive
    //         difference = new Date(difference);
    //     } else {
    //         difference = new Date(-difference);
    //     }
    //     console.log(difference);
    //
    //     return bus;
    // });

    res.render('bus/lookup/results', {buses, operatorCss});
}

module.exports = router;
