let opened = {};

window.tag = function() {
    let tags = Array.from(document.querySelectorAll('input[type=checkbox].busStopHideCheckbox'));

    tags.forEach(tag => {
        let id = tag.id;

        tag.on('click', () => {
            opened[id] = !opened[id];
        });
    });

    Object.keys(opened).forEach(id => {
        if (opened[id]) {
            $(`input#${id}`).setAttribute('checked', true);
        }
    })
}
