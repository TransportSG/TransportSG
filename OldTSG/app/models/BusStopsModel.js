const {BusStopsAPI} = require('../../lta-datamall'),
    mongoose = require('mongoose'),
    BusStop = require('./database/BusStop');

const configs = require('../../config.js');

const busStopsAPI = new BusStopsAPI(configs.accountKey);

exports.initStops = callback => {
    busStopsAPI.getBusStopsOperatingNow(stops => {
        for (let stopData of stops) {
            BusStop.find({
               busStopCode: stopData.busStopCode 
            }, (err, data) => {
                if ((data || []).length === 0) {
                    var busStop = new BusStop({
                        busStopCode: stopData.busStopCode,
                        name: stopData.nearbyIdentifiers,
                        latitude: stopData.latitude,
                        longitude: stopData.longitude
                    });
                    busStop.save();
                }
            });
        }
        callback();
    });
};

exports.findBusStop = (busStopCode, callback) => {
    BusStop.find({
        busStopCode
    }, (err, data) => {
        callback(data[0]);
    });
};

exports.findBusStopsFromLatLong = (coords, callback) => {
    BusStop.find({}).
    where('latitude').lte(coords[0] + 0.0035).gte(coords[0] - 0.0035).
    where('longitude').lte(coords[1] + 0.0035).gte(coords[1] - 0.0035).
    exec(callback);
};
