let bookmark = false;
let currentBusStop = location.pathname.split('/').slice(-1)[0];

$.ready(() => {
    $('#bookmark-status').on('click', () => {
        bookmark = !bookmark;
        if (bookmark) $('#bookmark-status').src = '/static/images/bookmark/filled.svg';
        else $('#bookmark-status').src = '/static/images/bookmark/empty.svg';

        setBookmarked(currentBusStop, bookmark);
    });

    bookmark = isBookmarked(currentBusStop);

    if (bookmark) $('#bookmark-status').src = '/static/images/bookmark/filled.svg';
    else $('#bookmark-status').src = '/static/images/bookmark/empty.svg';

    let locales = Array.from(document.querySelectorAll('span[locale]')).map(e=>e.getAttribute('locale'));
    let translations = Array.from(document.querySelectorAll('span[locale]')).map(e=>e.textContent);

    let currentLocale = 'english';

    if ($('.locale-change')) {
        $('.locale-change').on('click', () => {
            let newIndex = locales.indexOf(currentLocale) + 1;
            if (newIndex === locales.length) newIndex = 0;

            $('.locale-info').textContent = translations[newIndex];
            currentLocale = locales[newIndex];
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

setInterval(() => {
    $.ajax({
        url: '/timings/render-timings/' + currentBusStop
    }, (status, body) => {
        if (body) $('#content').innerHTML = body;
    });
}, 15000);
