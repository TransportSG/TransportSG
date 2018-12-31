const request = require('request');
const {accessKey} = require('../../../scrapers/lta-config.json');
// const data = require('./delay.json');
const MRTLineDelay = require('./MRTLineDelay');

const url = 'http://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts';

request({
    url,
    headers: {
        AccountKey: accessKey,
        accept: 'application/json'
    }
}, (err, resp, body) => {
    let data = JSON.parse(body).value;
    console.log(JSON.stringify(MRTLineDelay.parse(data), null, 2));
});
