const request = require('request');
const MRTLineDelay = require('./MRTLineDelay');

const url = 'http://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts';

module.exports = function getMRTDisruptions(accessKey, callback) {
    // request({
    //     url,
    //     headers: {
    //         AccountKey: accessKey,
    //         accept: 'application/json'
    //     }
    // }, (err, resp, body) => {
    //     if (err) {
    //         callback(err, null);
    //     } else {
    //         console.log('mrt delay data ', body);
    //         let data = JSON.parse(body).value;
    //         console.log(data)
    let data = require('./delay'), err=null;
            console.log(JSON.stringify(MRTLineDelay.parse(data), null, 2))
            callback(err, MRTLineDelay.parse(data));
    //     }
    // });
}
