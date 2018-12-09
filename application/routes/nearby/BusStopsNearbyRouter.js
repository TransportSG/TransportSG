let express = require('express');
let router = new express.Router();

router.get('/', (req, res) => {
    res.render('bus/stops/nearby');
});

router.post('/', (req, res) => {
    
})

module.exports = router;
