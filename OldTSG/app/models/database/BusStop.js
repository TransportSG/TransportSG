const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BusStopSchema = new Schema({
    busStopCode: String,
    name: String,
    latitude: Number,
    longitude: Number
});

var BusStopModel = mongoose.model('BusStop', BusStopSchema);

module.exports = BusStopModel;
