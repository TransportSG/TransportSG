let currentlyShowing = null;
let currentDirection = 1;

let scrolls = {};

function performQuery() {
    let query = $('#input').value;
    if (query.trim() ==  '') return;

    let url = (history.state || {}).page || location.pathname;

    if (currentlyShowing) {
        scrolls[currentlyShowing] = Array.from($(`#busServiceContainer-${currentlyShowing}`).querySelectorAll('.serviceDirectionContainer'))
                                    .map(d => d.scrollTop);
    }

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
            }

            currentDirection = 2;
            setDirection(1);
        });

        function setDirection(direction) {
            let width = window.innerWidth;
            if (width > 700) return;

            $(`#dircontainer-${currentlyShowing}-${currentDirection}`).style.display = 'none';
            $(`#dircontainer-${currentlyShowing}-${direction}`).style.display = 'block';

            $(`#dir-${direction}`).className = 'active';
            $(`#dir-${currentDirection}`).className = '';

            currentDirection = direction;
        }

        $('#dir-1').on('click', setDirection.bind(null, 1));
        $('#dir-2').on('click', setDirection.bind(null, 2));

        if (currentlyShowing) {
            if (!$(`#service-selector li[service="${currentlyShowing}"]`)) return;

            $(`#service-selector li[service="${currentlyShowing}"]`).click();
            $(`#service-selector li[service="${currentlyShowing}"]`).click();

            setDirection(currentDirection);

            Array.from($(`#busServiceContainer-${currentlyShowing}`).querySelectorAll('.serviceDirectionContainer'))
            .forEach((div, i) => {
                div.scrollTop = scrolls[currentlyShowing][i];
            });
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
        if ($('#dir-1')) {
            if (width > 700) {
                let parent = $(`#busServiceContainer-${currentlyShowing}`);
                if (parent.className.endsWith('2')) {
                    $(`#dircontainer-${currentlyShowing}-2`).style.display = 'block';
                }
                $(`#dircontainer-${currentlyShowing}-1`).style.display = 'block';


                $('#dir-1').className = '';
                $('#dir-2').className = '';
            } else {
                $(`#dir-${currentDirection}`).className = 'active';
            }
        }
    });
});
