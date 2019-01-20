window.setBookmarked = function(busStopCode, state) {
    localStorage.setItem(busStopCode, state);
    if (state == false)
        localStorage.removeItem(busStopCode);
}

window.isBookmarked = function(busStopCode) {
    return localStorage.getItem(busStopCode) === 'true';
}

window.getAllBookmarks = function() {
    return Object.keys(localStorage).filter(bsc => localStorage[bsc] === 'true');
}
