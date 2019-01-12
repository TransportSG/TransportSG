const request = require('request');
const MRTLineDelay = require('./MRTLineDelay');

const url = 'http://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts';

module.exports = function getMRTDisruptions(accessKey, callback) {
    request({
        url,
        headers: {
            AccountKey: accessKey,
            accept: 'application/json'
        }
    }, (err, resp, body) => {
        if (err) {
            callback(err, null);
        } else {
            let data = JSON.parse(body).value;
            console.log('mrt delay data ', JSON.stringify(data, null, 2));
            callback(err, MRTLineDelay.parse(data));
        }
    });
}
