let currentlyShowing = null;
let currentDirection = 1;

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

        createDropdown('service-selector', service => {
            if (currentlyShowing)
                $(`#busServiceContainer-${currentlyShowing}`).style.display = 'none'
            $(`#busServiceContainer-${service}`).style.display = 'flex';

            currentlyShowing = service;

            let parent = $(`#busServiceContainer-${service}`);
            if (parent.className.endsWith('1')) {
                $('#dir-2').style.display = 'none';
            } else {
                $('#dir-2').style.display = 'flex';
                console.log('a')
                setDirection(currentDirection);
                console.log('b')
            }

        });

        function setDirection(direction) {
            let width = window.innerWidth;
            if (width > 700) return;

            $(`#dircontainer-${currentlyShowing}-${currentDirection}`).style.display = 'none';
            $(`#dircontainer-${currentlyShowing}-${direction}`).style.display = 'block';

            $(`#dir-${currentDirection}`).className = '';
            $(`#dir-${direction}`).className = 'active';

            currentDirection = direction;
        }

        $('#dir-1').on('click', setDirection.bind(null, 1));
        $('#dir-2').on('click', setDirection.bind(null, 2));

        if (currentlyShowing) {
            if (!$(`#service-selector li[service="${currentlyShowing}"]`)) return;

            $(`#service-selector li[service="${currentlyShowing}"]`).click();
            $(`#service-selector li[service="${currentlyShowing}"]`).click();


            let parent = $(`#busServiceContainer-${currentlyShowing}`);
            if (parent.className.endsWith('2')) {
                setDirection(currentDirection);
            }
        }

        tag();
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

    window.on('resize', () => {
        let width = window.innerWidth;
        if (!currentlyShowing) return;

        if ($('#dir-1')) {
            if (width > 700) {
                let parent = $(`#busServiceContainer-${currentlyShowing}`);
                Array.from($(`#busServiceContainer-${currentlyShowing} .serviceDirectionContainer`)).forEach(e => {
                    e.style.display = 'block';
                });

                $('#dir-1').className = '';
                $('#dir-2').className = '';
            } else {
                let parent = $(`#busServiceContainer-${currentlyShowing}`);
                if (parent.className.endsWith('2'))
                    $(`#dir-${currentDirection}`).className = 'active';
            }
        }
    });
});
