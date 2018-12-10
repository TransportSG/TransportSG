const express = require('express');
let router = new express.Router();

const TextParser = require('./parser');
const depotList = require('./naughty_list');

function parseQuery(query) {
    let parsed = TextParser.parse(query, {
        services: {
            type: /(!?\d+[GWABC#M]?)/,
            canRepeat: true
        },
        wheelchair: ['wab', 'nwab'],
        type: ['SD', 'DD', 'BD'],
        depots: {
            type: ['SLBP', 'UPDEP', 'BBDEP', 'HGDEP', 'BNDEP', 'SMBAMDEP', 'SBSAMDEP', 'SEDEP', 'KJDEP', 'WLDEP', 'BUDEP', 'LYDEP'],
            canRepeat: true
        }
    });
    parsed.wheelchair = !(parsed.wheelchair || 'wab').includes('n');
    parsed.type = Math.max(0, ['', 'SD', 'DD', 'BD'].indexOf(parsed.type));

    return parsed;
}

function resolveServices(parsed) {
    let depots = parsed.depots || [];

    let svcs = depots.map(depot => depotList[depot]).reduce((acc, dep) => acc.concat(dep), []);

    let allSvcs = (parsed.services || []).concat(svcs);
    parsed.services = allSvcs.filter((svc, i) => allSvcs.indexOf(svc) == i)
        .filter(svc => allSvcs.indexOf('!' + svc) === -1);

    return parsed;
}

router.get('/', (req, res) => {
    res.render('secret/candies');
});

router.post('/', (req, res) => {
    let {query} = req.body;

    if (!query) {
        res.status(400).end();
    }

    let parsed = resolveServices(parseQuery(query));

    res.end(JSON.stringify(parsed) + ';');
});

module.exports = router;
