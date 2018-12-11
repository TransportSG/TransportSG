const ltaConfig = require('../../../../scrapers/lta-config.json');
const request = require('request');

let {accessKey} = ltaConfig;

function getLTATimings(busStopCode, service, callback) {
    let url = 'http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=' + busStopCode + '&ServiceNo=' + service;

    request({
        url,
        headers: {
            AccountKey: accessKey
        }
    }, (err, resp, body) => {
        let data = JSON.parse(body);

        let service = data.Services[0];
        if (!service) {callback([]); return};
        let timings = [service.NextBus, service.NextBus2, service.NextBus3];

        callback(timings.filter(bus => bus.OriginCode !== ''));
    });
}

function is123MNWABPresent(callback) {
    let keyBusStops = ['14009', '14021', '14031', '10149', '10379', '14381', '14141'];
    let promises = [];

    let present = false;

    keyBusStops.forEach(busStopCode => {
        promises.push(new Promise(resolve => {
            getLTATimings(busStopCode, '123M', timings => {
                if (timings.filter(bus => bus.Feature === '').length > 0) present = true;
                resolve();
            });
        }));
    });

    Promise.all(promises).then(() => {
        callback(present);
    });
}

module.exports = is123MNWABPresent;
