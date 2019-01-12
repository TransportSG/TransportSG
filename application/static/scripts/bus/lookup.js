let method = 'rego';

function performQuery() {
    let query = $('#input').value;
    if (query.trim() ==  '') {
        $('#results').innerHTML = '';
        return;
    };

    $('#loading').style.display = 'block';

    $.ajax({
        url: '/lookup/',
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
                break;
            case 'Service':
                $('#input').setAttribute('type', 'text');
                break;
        }
    });

    $('#lookup-method-div span').textContent = 'Rego';

    let inputTimeout = 0;

    let input = $('#input');

    input.on('input', () => {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(performQuery, 650);
    });

    performQuery();
});
