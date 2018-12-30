module.exports = (req, res) => {
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
            return dir;
        });

        res.json(serviceDirections);
    });
};
