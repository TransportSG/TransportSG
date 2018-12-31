let express = require('express');
let router = new express.Router();

router.get('/', (req, res) => {
    res.render('mrt/disruptions', {hideDisruptionLink: true});
});

module.exports = router;
