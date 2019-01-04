let bookmark = false;
let currentBusStop = location.pathname.split('/').slice(-1)[0];

$.ready(() => {
    $('#bookmark-status').on('click', () => {
        bookmark = !bookmark;
        if (bookmark) $('#bookmark-status').src = '/static/images/bookmark/filled.svg';
        else $('#bookmark-status').src = '/static/images/bookmark/empty.svg';

        setBookmarked(bookmark);
    });

    // idb.open('bookmarks', 1, db => {
    //     let store = db.createObjectStore('bus-stops', {
    //         keyPath: 'id'
    //     });
    // });

    isBookmarked(bookmarked => {
        bookmark = bookmarked;

        if (bookmark) $('#bookmark-status').src = '/static/images/bookmark/filled.svg';
        else $('#bookmark-status').src = '/static/images/bookmark/empty.svg';
    });

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

function setBookmarked(state) {
    idb.open('bookmarks', 1).then(function(db) {
        var tx = db.transaction(['bus-stops'], 'readwrite');
        var store = tx.objectStore('bus-stops');
        store.put({id: currentBusStop, data: {bookmarked: state}});
        return tx.complete;
    });
}

function isBookmarked(cb) {
    idb.open('bookmarks', 1).then(function(db) {
        var tx = db.transaction(['bus-stops'], 'readonly');
        var store = tx.objectStore('bus-stops');

        store.get(currentBusStop).then(state => {
            if (state)
                cb(state.data.bookmarked);
            else
                cb(false);
        });
    });
}

function getTimingsDifference(a, b) {
    let d = new Date(Math.abs(a - b));
    return {minutes: d.getUTCMinutes(),seconds: d.getUTCSeconds()};
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
    }, body => {
        $('#content').innerHTML = body;
    });
}, 15000);
