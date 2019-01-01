function calcDist(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 +
          c(lat1 * p) * c(lat2 * p) *
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function parseTime(time) {
    let parts = time.match(/(\d+)/g);
    let hour = parts[0]*1, minutes = parts[1]*1;
    let minutesSinceMidnight = hour * 60 + minutes;

    return minutesSinceMidnight;
}

function findTimeDifference(a, b) {
    a = parseTime(a), b = parseTime(b);
    let diff = Math.abs(a - b);

    return diff;
}

function calculateFrequency(departures) {
    departures = departures.toLowerCase();
    if (departures.includes('/')) {
        let frequency = departures.split('/')[1].match(/(\d+)/g);
        return {min: frequency[0], max: frequency.reverse()[0]};
    } else if (departures.includes('one') && departures.includes('at')) {
        return {min: 0, max: 0};
    } else if (!departures.includes('/')) {
        let times = departures.match(/([.\d]{1,4}\wm)/g);
        let intervals = times.map((time, i) => {
            if (i == 0) return null;
            return findTimeDifference(time, times[i - i]);
        }).filter(Boolean).sort((a,b) => a - b);

        return {min: intervals[0], max: intervals.reverse()[0]};
    } else if (departures.includes('headway')) {
        let headway = departures.match(/\((\d+) min[\w ]+\)/)[1];
        return {min: headway, max: headway}
    }
}

function pad(str, pad, length) {
    return Array(length).fill(pad).concat([...str]).slice(-length).join('');
}

function findFirstAndLastBus(departures) {
    let times = departures.match(/([.\d]{1,4} ?\wm)/g);
    times = times.map(parseTime).sort((a, b) => a - b).map(time => {
        let hours = Math.floor(time / 60)+'';
        let minutes = time % 60+'';
        return pad(hours, 0, 2) +  pad(minutes, 0, 2);
    });

    let firstBus = times[0], lastBus = times.reverse()[0];

    return {firstBus, lastBus};
}


module.exports = {
    calcDist,
    calculateFrequency,
    findFirstAndLastBus,
    pad
}
