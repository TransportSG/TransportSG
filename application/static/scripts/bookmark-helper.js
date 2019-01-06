window.setBookmarked = function(busStopCode, state) {
    localStorage.setItem(busStopCode, state);
}

window.isBookmarked = function(busStopCode) {
    return localStorage.getItem(busStopCode) === 'true';
}

window.getAllBookmarks = function() {
    return Object.keys(localStorage);
}
