const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ServerMetadataSchema = new Schema({
    type: String,
    data: Object,
    updated: Date,
});

var ServerMetadataModel = mongoose.model('ServerMetadata', ServerMetadataSchema);

module.exports = ServerMetadataModel;
