function processLocation(location) {
    let {coords} = location;
    // let {latitude, longitude} = coords;
    let latitude = 1.436667, longitude= 103.786111

    $.ajax({
        method: 'POST',
        data: {
            latitude, longitude
        }
    }, data => {
        $('#content').innerHTML = data;
        if (tag) tag();
    });
}

function error(err) {

}

$.ready(() => {
    if ('geolocation' in navigator) {
        let geo = navigator.geolocation;

        geo.watchPosition(processLocation, error, {
            enableHighAccuracy: true,
        });
    }
});
