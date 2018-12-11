function createDropdown(id, onChange) {
    let ul = $('#' + id);
    ul.className += ' selector-dropdown';

    let optionBox;
    if (!!$('#' + id + '-div'))
        optionBox = $('#' + id + '-div');
    else {
        optionBox = document.createElement('div');
        optionBox.id = id + '-div';
        optionBox.className = 'selectorButton';
    }
    optionBox.innerHTML = '<span>Select an option</span>';

    let dropdownStatus = false;
    let selectedIndex = -1;

    function toggleDropdown() {
        dropdownStatus = !dropdownStatus;

        if (dropdownStatus) {
            optionBox.className += ' opened';
            ul.style.zIndex = 1000;
            optionBox.style.zIndex = 1001;
        }
        else {
            optionBox.className = optionBox.className.slice(0, optionBox.className.length - 7)
            ul.style.zIndex = '';
            optionBox.style.zIndex = '';
        }

        ul.style.display = dropdownStatus ? 'block' : 'none';

    }

    optionBox.on('click', toggleDropdown);

    let options = Array.from(ul.querySelectorAll('li'));

    options.forEach((option, i) => {
        option.on('click', () => {
            toggleDropdown();
            if (options[selectedIndex])
                options[selectedIndex].setAttribute('selected', false)

            selectedIndex = i;

            $('#' + id + '-div span').textContent = option.textContent;
            option.setAttribute('selected', true);

            onChange(option.textContent);
        });
    });

    ul.parentElement.insertBefore(optionBox, ul);
    ul.style.display = 'none';
}

$.ready(() => {
    createDropdown('lineSelector', line => {
        let stationSelectorStub = $('#stationSelectorStub');
        if (stationSelectorStub)
            stationSelectorStub.parentElement.removeChild(stationSelectorStub);

        let stationSelector = $('#stationSelector');
        stationSelector.innerHTML = stationData[line].stations.map(station =>
            `<li>${station.stationNumber} ${station.stationName}</li>`
        ).join('');

        createDropdown('stationSelector', station => {

        });
    });
});
