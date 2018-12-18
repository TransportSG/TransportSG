let opened = {};

window.tag = function() {
    let tags = Array.from(document.querySelectorAll('input[type=checkbox].busStopHideCheckbox'));

    tags.forEach(tag => {
        let busStopCode = tag.getAttribute('bus-stop-code');

        tag.on('click', () => {
            opened[busStopCode] = !opened[busStopCode];
        });
    });

    Object.keys(opened).forEach(busStopCode => {
        if (opened[busStopCode]) {
            $(`input#checkbox-${busStopCode}`).setAttribute('checked', true);
        }
    })
}
