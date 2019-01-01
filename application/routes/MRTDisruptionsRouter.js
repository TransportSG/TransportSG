let express = require('express');
let router = new express.Router();

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
    res.render('mrt/disruptions', {hideDisruptionLink: true, mrtLineAbbreviations});
});

module.exports = router;
