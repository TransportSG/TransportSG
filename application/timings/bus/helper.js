const request = require('request');
const vars = require('./support');

const c = vars.chars;

var timingsURL = 'https://s3-ap-southeast-1.amazonaws.com/lta-eta-web-2/bus_arrival.baf3.js';

function createSortIndex(s) {
    let numberPart = s.match(/(\d+)/)[1]*1;
    let letterPart = s.match(/(\w+)/)[1];
    letterPart = [...letterPart].map(e=>e.charCodeAt(0)).reduce((a, b) => a + b, '');

    return parseFloat(numberPart + '.' + letterPart);
}

let nwabOverrideServices = ['43M', '63M', '123M', '139M', '143M', '147e', '160A', '162M', '502A', '657'];
let nwabSDOverrides = ['657', '188e', '859A', '859B', '854e', '868E'];

module.exports = callback => {
    request({
      method: 'GET',
      uri: timingsURL,
      gzip: true
    }, (err, resp, body) => {
        var timings = {};

        function parseDate(timing) {
            return new Date('20' + timing[0] + ' ' + timing[1] + ' ' + timing[2] + ' ' + timing[3] + ':' + timing[4] + ':' + timing[5] + ' GMT+0000');
        }

        function etaCallback(args) {
            var data = args[1];
            var busStops = data.split('$');
            busStops.forEach(busStop => {
                var busStopCode = busStop.split('|')[0];

                timings[busStopCode] = [];

                var timingsForServices = busStop.split('|')[1];
                var services = timingsForServices.split(';');
                services = services.sort((prev, curr) => {
                    return createSortIndex(prev) - createSortIndex(curr);
                });
                services.forEach(service => {
                    var serviceData = service.split(':');
                    var serviceNo = serviceData[0],
                        timingData = serviceData[1],
                        destination = serviceData[2];

                    if (destination === '02089') destination = '02099';
                    if (destination === '03218') destination = '03239';

                    if (busStopCode === '84009' && serviceNo === 'CT18') return;
                    if (busStopCode === '55509' && serviceNo === 'CT8') return;

                    timings[busStopCode].push({
                        timings: timingData.match(/(.{10})/g).map(timing => {
                            timing = [...timing].map(e => c[e]);

                            if (nwabOverrideServices.includes(serviceNo))
                                timing[6] = '1';

                            if (nwabSDOverrides.includes(serviceNo) && timing[8] === '1')
                                timing[6] = '1';

                            return {
                                arrivalTime: parseDate(timing),
                                isWAB: timing[6] === '1',
                                load: timing[7],
                                busType: timing[8]
                            };
                        }).filter(timing => timing.load !== '-'),
                        service: serviceNo,
                        destination
                    });
                });
            });
            callback(timings);
        }

        eval(body);
    });
}
