let currentlyShowing = null;
let currentDirection = 1;

function processLocation(location) {
    let {coords} = location;
    // let {latitude, longitude} = coords;
    let latitude = 1.436667, longitude = 103.786111

    $.ajax({
        method: 'POST',
        data: {
            latitude, longitude
        }
    }, (content) => {
        if (content.location)
            location = content.location;
        else
            $('#content').innerHTML = content;

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
            $(`#service-selector li[service="${currentlyShowing}"]`).click();
            $(`#service-selector li[service="${currentlyShowing}"]`).click();

            setDirection(currentDirection);
        }

        tag();
    });
}

$.ready(() => {
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


    if ('geolocation' in navigator) {
        let geo = navigator.geolocation;

        geo.watchPosition(processLocation, () => {}, {
            enableHighAccuracy: true,
        });
    }
});
