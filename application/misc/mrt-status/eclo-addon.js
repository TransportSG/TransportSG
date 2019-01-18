let {listToMRTStations} = require('./MRTLineDelay');
let eclos = require('./eclo');

module.exports = function getActiveECLOs() {
    let active = eclos.filter(eclo => eclo.isActive());
    active = active.map(eclo => {
        eclo.stations = listToMRTStations(eclo.stationList);

        return eclo;
    });

    return active;
}
