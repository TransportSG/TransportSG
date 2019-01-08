$.ready(() => {
    if (getAllBookmarks().length === 0) {
        $('div#content').innerHTML =
            '<div id="content"><div id="no-bookmarks"><span>Nothing appears to be bookmarked!</span></div></div>';
        return;
    }
    $.ajax({
        url: '/bookmarks/render?bus-stops=' + getAllBookmarks().toString()
    }, (status, data) => {
        if (data) $('div#content').innerHTML = data;
    });
});
