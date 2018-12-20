function performQuery() {
    let query = $('#input').value;
    if (query.trim() ==  '') return;

    let url = (history.state || {}).page || location.pathname;

    $.ajax({
        url,
        method: 'POST',
        data: {
            query
        }
    }, (content) => {
        if (content.location)
            location = content.location;
        else
            $('#results').innerHTML = content;

        let currentlyShowing = null;
        createDropdown('service-selector', service => {
            if (currentlyShowing !== null) {console.log(currentlyShowing)
                $(`#busServiceContainer-${currentlyShowing}`).style.display = 'none'}
            $(`#busServiceContainer-${service}`).style.display = 'flex';

            currentlyShowing = service;
        });
    });
}

$.ready(() => {
    let inputTimeout = 0;

    let input = $('#input');

    input.on('input', () => {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(performQuery, 850);
    });

    if (search.query.hide) {
        history.pushState({page: location.pathname}, 'Fish Candies', '/search');
        setInterval(performQuery, 5000);

    }

    performQuery();
});
