function quantify(data, value, allowZero) {
    if (value || (allowZero && !value)) {
        data.push(Array(2).fill(0).concat([...`${value}`]).slice(-2).join(''));
    } else {
        data.push('00');
    }
    return data;
}

module.exports = function prettySeconds(seconds) {

    var data = [];

    if (typeof seconds === 'number') {

        function fix10(number) {
            return number.toFixed(10);
        }
        data = quantify(data, parseInt(fix10((seconds % 86400) / 3600))); // Hour
        data = quantify(data, parseInt(fix10((seconds % 3600) / 60))); // Min
        data = quantify(data, Math.floor(seconds % 60), data.length < 1); //Sec

    }

    if (data[0] === '00') data = data.slice(1);

    return data.join(':');
}

