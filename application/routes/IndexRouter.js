let express = require('express');
let router = new express.Router();

const SecretCandy = require('../secret/nothing_to_see_here/go_away/SecretCandy');

router.get('/', (req, res) => {
    res.render('index');
});

router.use("/unikitty's%20fish%20candies", SecretCandy);

module.exports = router;
