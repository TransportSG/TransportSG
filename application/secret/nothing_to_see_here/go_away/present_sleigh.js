const TextParser = require('./parser');

    TextParser.parse(query, {
        services: {
            type: /(!?\d+[GWABC#M]?)/,
            canRepeat: true
        },
        wheelchair: ['wab', 'nwab'],
        type: ['SD', 'DD', 'BD'],
        depots: {
            type: ['SLBP', 'UPDEP', 'BBDEP', 'HGDEP', 'BNDEP', 'AMDEP', 'KJDEP', 'WLDEP'],
            canRepeat: true
        }
    });
