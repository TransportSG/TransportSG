$.ready(() => {
    $.ajax({
        url: '/bookmarks/render?bus-stops=' + getAllBookmarks().toString()
    }, data => {
        $('div#content').innerHTML = data;
    });
});
