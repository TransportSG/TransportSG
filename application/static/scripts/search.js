function performQuery() {
    let query = $('#input').value;
    if (query.trim() ==  '') return;

    $.ajax({
        url: '/search/',
        method: 'POST',
        data: {
            query
        }
    }, (content) => {
        $('#results').innerHTML = content;
    });
}

$.ready(() => {
    let inputTimeout = 0;

    let input = $('#input');

    input.on('input', () => {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(performQuery, 850);
    });

    performQuery();
});
