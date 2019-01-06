const DatabaseConnection = require('../../application/database/DatabaseConnection');
const config = require('../../config.json');
const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const path = require('path');

let database = new DatabaseConnection(config.databaseURL, 'TransportSG');
let busStops = null;
let csvData = fs.readFileSync(path.join(__dirname, '/chinese_bus_stop_names.csv')).toString();

let promises = [];

database.connect((err) => {
    busStops = database.getCollection('bus stops');
    csvData = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });

    csvData.forEach(busStopLocale => {
        let newData = {
            locale: {
                chinese: {
                    roadName: busStopLocale.chinese_street_name,
                    busStopName: busStopLocale.chinese_bus_stop_name
                }
            },
            nearbyAttraction: busStopLocale.attraction
        }

        promises.push(new Promise(resolve => {
            busStops.updateDocument({
                busStopCode: busStopLocale.bus_stop_code
            }, {
                $set: newData
            }, () => {
                resolve();
            });
        }));
    });

    Promise.all(promises).then(() => {
        console.log('updated ' + promises.length + ' bus stops');
        process.exit();
    });
});
