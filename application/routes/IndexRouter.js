let express = require('express');
let router = new express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;
