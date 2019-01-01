module.exports = {
    getBusService: (req, res) => {
        let busServices = res.db.getCollection('bus services');

        busServices.findDocuments({
            fullService: req.params.busService
        }, {_id: 0}).toArray((err, serviceDirections) => {
            if (!serviceDirections.length) {
                res.status(404).json({
                    error: 'No such bus service'
                })
                return;
            }

            serviceDirections = serviceDirections.map(dir => {
                delete dir._id;
                delete dir.special;

                return dir;
            }).sort((a, b) => a.routeDirection - b.routeDirection);

            res.json(serviceDirections);
        });
    },
    getAllBusServices: (req, res) => {
        let busServices = res.db.getCollection('bus services');
        busServices.distinct('fullService', (err, distinct) => {
            res.json(distinct);
        });
    }
}
