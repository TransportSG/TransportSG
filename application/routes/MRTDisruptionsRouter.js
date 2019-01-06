let express = require('express');
let router = new express.Router();

const MRTDisruptions = require('../misc/mrt-status');

let mrtLineAbbreviations = {
    "CCL": "Circle Line",
    "CEL": "Circle Line Extension",
    "CGL": "Changi Airport Branch Line",
    "DTL": "Downtown Line",
    "EWL": "East West Line",
    "NEL": "North East Line",
    "NSL": "North South Line",
    "PEL": "Punggol LRT East Loop",
    "PWL": "Punggol LRT West Loop",
    "SEL": "Sengkang LRT East Loop",
    "SWL": "Sengkang LRT West Loop",
    "BPL": "Bukit Panjang LRT"
}

router.get('/', (req, res) => {
    res.render('mrt/disruptions', {
        hideDisruptionLink: true, mrtLineAbbreviations,
        MRTDisruptions: MRTDisruptions.getMRTDisruptions(),
        MRTDisruptionsLastUpdate: MRTDisruptions.getMRTDisruptionsLastUpdate()
    });
});

router.post('/', (req, res) => {
    let allDisruptions = MRTDisruptions.getMRTDisruptions();

    let eclos = allDisruptions.filter(e=>e.isScheduled);
    let disruptions = allDisruptions.filter(e=>!e.isScheduled).sort((a,b)=>b.since-a.since);;

    if (disruptions.length) res.json({status: 'disrupted'});
    else if (eclos.length) res.json({status: 'scheduled works'});
    else res.json({status: 'ok'});
})

module.exports = router;
