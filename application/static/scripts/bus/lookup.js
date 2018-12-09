function performQuery() {
    let query = $('#input').value;
    if (query.trim() ==  '') return;

    $.ajax({
        url: '/lookup/',
        method: 'POST',
        data: {
            method: 'rego',
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
        inputTimeout = setTimeout(performQuery, 650);
    });

    performQuery();
});
