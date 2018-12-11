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
        .sort((a, b) => e(a) - e(b)).join(', ').trim();
}

let previous = '';

function createEmailBody() {
    let data = {
        mkivDeployments: getServices('SLBP BBDEP UPDEP HGDEP nwab SD !123M !160A !63M'),
        vsoDeployments: getServices('BNDEP SBSAMDEP BRBP nwab DD'),
        demons: getServices('KJDEP SMBAMDEP nwab DD'),
        mandy: getServices('wab BD'),
        nwabBendy: getServices('nwab BD'),
        expUpsize: getServices('14e 30e 74e 97e 151e 174e 196e DD'),
        budepUpsize: getServices('947 DD'),
        kjdepUpsize: getServices('300 301 302 307 DD'),
        kjdepDownsize: getServices('180 972 SD'),
        kjdepBendy: getServices('61 176 180 700 700A 972 983 985 BD'),
        slbpDownsize: getServices('179 179A 182 192 198 198A 241 247 248 249 251 252 253 254 255 257 SD'),
        bndepDownsize: getServices('23 65 7A SD'),
        sedepBendy: getServices('851 851e BD'),
        updepUpsize: getServices('120 122 272 273 93 DD'),
        bbdepDownsize: getServices('147e 7B SD')
    };

    if (previous === JSON.stringify(data)) return null;

    previous = JSON.stringify(data);

    let email = pug.renderFile(path.join(__dirname, 'present_wrapper.pug'), data);
    return email;
}

function sendEmail(body) {
    presents.people.forEach(email => {
        server.send(emailjs.message.create({
           text:    body,
           from:    "me <sbs9642p@gmail.com>",
           to:      `me <${email}>`,
           subject:  "Bus Timing Update",
           attachment: [
               {data: body, alternative: true}
           ]
       }), function(err, message) { console.log(err || message); });
    });
}

setInterval(() => {
    let body = createEmailBody();
    if (body !== null)
        sendEmail(createEmailBody());
}, 1000 * 60 * 3);

setTimeout(() => {
    sendEmail(createEmailBody());
}, 12000);
