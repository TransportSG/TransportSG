function processLocation(location) {
    let {coords} = location;
    let {latitude, longitude} = coords;

    $.ajax({
        method: 'POST',
        data: {
            latitude, longitude
        }
    }, (status, data) => {
        $('#content').innerHTML = data;
        if (status === 200 && !data) navigator.geolocation.clearWatch(watchID);

        if (typeof tag === 'function') tag();
    });
}

function error(err) {
    $('#content').innerHTML = `<div class='error'><span class='errorMessage'>${err.message}</span></div>`;
}

let watchID;

$.ready(() => {
    if ('geolocation' in navigator) {
        let geo = navigator.geolocation;

        watchID = geo.watchPosition(processLocation, error, {
            enableHighAccuracy: true,
        });
    }
});

function getTimingsDifference(a, b) {
    let d = new Date(Math.abs(a - b));
    return {minutes: d.getUTCMinutes() + d.getUTCHours() * 60,seconds: d.getUTCSeconds()};
};
function hasArrived(timing) {
    return +new Date() - +new Date(timing) > 0;
}

function setTimes() {
    let now = new Date();

    Array.from(document.querySelectorAll('.bus-arrival')).forEach(div => {
        let arrivalTime = new Date(div.getAttribute('arrival'));
        let difference = getTimingsDifference(arrivalTime, now);

        if (hasArrived(arrivalTime)) {
            div.children[0].textContent = 'Arr';
            div.children[0].className = 'bus-arr';
            div.children[1].textContent = '';
        } else {
            div.children[0].textContent = difference.minutes;
            div.children[1].textContent = difference.seconds;
        }
    });
}

setInterval(setTimes, 1000);
