function createDropdown(id, onChange) {
    let ul = $('#' + id);
    ul.className += ' selector-dropdown';

    let optionBox = document.createElement('div');
    optionBox.id = id + '-div';
    optionBox.className = 'selectorButton';
    optionBox.innerHTML = '<span>Select an option</span>';

    let dropdownStatus = false;
    let selectedIndex = -1;

    function toggleDropdown() {
        dropdownStatus = !dropdownStatus;

        if (dropdownStatus)
            optionBox.className += ' opened';
        else
            optionBox.className = optionBox.className.slice(0, optionBox.className.length - 7)

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
    createDropdown('lineSelector', option => {
        console.log(option);
    });
});
