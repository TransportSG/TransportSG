let express = require('express');
let router = new express.Router();
const {exec} = require('child_process');

let buildNumber, buildComment;

const moment = require('moment');
require('moment-precise-range-plugin');

exec('git describe --always', {
    cwd: process.cwd()
}, (err, stdout, stderr) => {
    buildNumber = stdout.toString().trim();

    exec('git log -1 --oneline --pretty=%B', {
        cwd: process.cwd()
    }, (err, stdout, stderr) => {
        buildComment = stdout.toString().trim();

    })
});
const SecretCandy = require('../secret/nothing_to_see_here/go_away/SecretCandy');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/everything', (req, res) => {
    res.render('all-features', {buildNumber, buildComment, moment});
});

router.use("/unikitty's%20fish%20candies", SecretCandy);

module.exports = router;
