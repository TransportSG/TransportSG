const {accessKey} = require('../../../scrapers/lta-config.json');

const getMRTDisruptions = require('./lib');
const getECLOs = require('./eclo-addon');

let disruptions = [];
let disruptionsLastUpdate = 0;

function shouldRun() {
    let hours = new Date().getUTCHours() + 8;

    return process.env.NODE_ENV === 'prod' ? (hours >= 5 && hours <= 23) : false;
}

function updateDisruptions() {
    if (shouldRun()) {
        getMRTDisruptions(accessKey, (err, newDisruptions) => {
            if (err) return;
            disruptions = newDisruptions.concat(getECLOs());
            disruptionsLastUpdate = new Date();
        });
    } else {
        disruptions = getECLOs();
        disruptionsLastUpdate = new Date();
    }
}

setInterval(updateDisruptions, 15 * 60 * 1000);
updateDisruptions();

module.exports.getMRTDisruptions = function() { return disruptions; }
module.exports.getMRTDisruptionsLastUpdate = function () { return disruptionsLastUpdate; }
