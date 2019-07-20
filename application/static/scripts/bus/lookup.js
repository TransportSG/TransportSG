let method = 'rego';

function performQuery() {
    let query = method === 'advanced' ? $('#multiline-input').value : $('#input').value;
    if (query.trim() ==  '') {
        $('#results').innerHTML = '';
        return;
    };

    $('#loading').style.display = 'block';

    let url = '/lookup/';
    if (location.hostname.startsWith('bus.'))
        url = '/';

    $.ajax({
        url,
        method: 'POST',
        data: {
            method,
            query
        }
    }, (status, content) => {
        $('#loading').style.display = 'none';

        if (status == 200) $('#results').innerHTML = content;
    });
}

$.ready(() => {
    createDropdown('lookup-method', chosen => {
        method = chosen.toLowerCase();

        switch(chosen) {
            case 'Rego':
                $('#input').setAttribute('type', 'number');
                $('#searchbar').className = '';
                $('#input').style.display = 'block';
                $('#multiline-input').style.display = 'none';
                break;
            case 'Service':
                $('#input').setAttribute('type', 'text');
                $('#searchbar').className = '';
                $('#input').style.display = 'block';
                $('#multiline-input').style.display = 'none';
                break;
            case 'Advanced':
                $('#input').setAttribute('type', 'text');
                $('#searchbar').className = 'expanded';
                $('#input').style.display = 'none';
                $('#multiline-input').style.display = 'block';
                break;
        }
    });

    $('#lookup-method-div span').textContent = 'Rego';

    $('#input').on('input', e => {
        if ($('#input').value.length > 4);
        $('#input').value = $('#input').value.slice(0, 4);

        e.preventDefault();
        e.stopPropagation();
    }, false)

    createInputTimeout($('#input'));
    createInputTimeout($('#multiline-input'));
    performQuery();
});

function createInputTimeout(element) {
    let inputTimeout = 0;

    element.on('input', () => {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(performQuery, 650);
    });
}
