$.ready(() => {
    $.ajax({
        url: '/bookmarks/render?bus-stops=' + getAllBookmarks().toString()
    }, (status, data) => {
        $('div#content').innerHTML = data;
    });
});
