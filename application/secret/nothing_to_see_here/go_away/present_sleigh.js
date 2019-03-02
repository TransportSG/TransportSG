const emailjs = require('emailjs');
const path = require('path');

const presents = require('./present_list');
const elfMagic = require('./elves_at_work');

const pug = require('pug');

let server = emailjs.server.connect({
    user:    presents.user,
    password: presents.password,
    host:    presents.host,
    ssl:     true
});

function getServices(query) {
    let parsed = elfMagic.resolveServices(elfMagic.parseQuery(query));
    let buses = elfMagic.filterBuses(parsed);
    function e(a) {return a.match(/(\d+)/)[1];}

    return services = Object.values(buses).map(busStop => busStop.map(svc => svc.service))
        .reduce((a, b) => a.concat(b), []).filter((element, index, array) => array.indexOf(element) === index)
        .sort((a, b) => e(a) - e(b));
}

let previous = {};

function arrayDiff(source, check) {
    let missing = [];
    source.forEach(target => {
        if (!check.includes(target)) missing.push(target);
    });

    return missing
}

function findDifferences(data) {
    let different = false;

    let differences = {};
    Object.keys(data).forEach(fieldName => {
        let currentServices = data[fieldName];
        let additions = arrayDiff(currentServices, previous[fieldName] || []);
        let subtractions = arrayDiff(previous[fieldName] || [], currentServices);

        if (additions.concat(subtractions).length !== 0) different = true;

        differences[fieldName] = {additions, subtractions};
    });

    return {differences, different};
}

function createEmailBody(callback) {
    let data = {
        mkivDeployments: getServices('SLBP BBDEP UPDEP HGDEP nwab SD'),
        vsoDeployments: getServices('BNDEP SBSAMDEP BRBP nwab DD'),
        mandy: getServices('wab BD'),
        nwabBendy: getServices('nwab BD'),
        expUpsize: getServices('14e 30e 74e 97e 151e 174e 196e DD'),
        budepUpsize: getServices('77 143M 947 DD'),
        kjdepUpsize: getServices('307 970 DD'),
        kjdepDownsize: getServices('180 972 SD'),
        kjdepBendy: getServices('61 176 180 700 700A 972 983 985 BD'),
        woodlandsBendy: getServices('178 187 960e 961 963 965 966 951e BD'),
        wldepUpsize: getServices('178 900A 902 903M 904 912 912A 912B 912M DD'),
        slbpDownsize: getServices('179 179A 182 192 198 198A 241 247 248 249 251 252 253 254 255 257 SD'),
        bndepDownsize: getServices('23 35 35M 37 65 168 7A SD'),
        hgdepDownsize: getServices('87 89e 161 SD'),
        brbpDownsize: getServices('88 SD'),
        amdepDownsize: getServices('50 SD'),
        sedepBendy: getServices('SEDEP !800 !804 !806 !807 !811 !812 BD'),
        updepUpsize: getServices('120 122 272 273 93 DD'),
        bbdepDownsize: getServices('147e 147 SD'),
        amdepUpsize: getServices('855 DD'),
        hgdepUpsize: getServices('156 DD')
    };

    let changes = findDifferences(data);

    if (!changes.different) {
        callback(null);
        return;
    }

    previous = data;

    let email = pug.renderFile(path.join(__dirname, 'present_wrapper.pug'), {data, differences: changes.differences});
    callback(email);
}

function sendEmail(body) {
    let main = presents.people[0];
    let more = presents.people.slice(1);
    server.send(emailjs.message.create({
       text:    body,
       from:    "me <sbs9642p@gmail.com>",
       to:      `me <${main}>`,
       bcc:     more.map(e => `a cat <${e}>`).join(', '),
       subject:  "Bus Timing Update",
       attachment: [
           {data: body, alternative: true}
       ]
   }), function(err, message) { if (err) console.error(err); });
}

if (process.env['NODE_ENV'] && process.env['NODE_ENV'] === 'prod') {
    setInterval(() => {
        createEmailBody(body => {
            if (body !== null)
                sendEmail(body);
        });
    }, 1000 * 60 * 5);

    setTimeout(() => {
        createEmailBody(body => {
            sendEmail(body);
        });
    }, 12000);
}
