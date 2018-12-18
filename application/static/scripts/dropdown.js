let allDropdowns = [];

window.createDropdown = function createDropdown(id, onChange) {
    let ul = $('#' + id);

    let ulHTML = ul.innerHTML;
    let newUl = document.createElement('ul');
    newUl.innerHTML = ulHTML;

    newUl.id = id;
    newUl.className = 'selector-dropdown';

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
            optionBox.className = optionBox.className.replace(/ opened/g, '');
            ul.style.zIndex = '';
            optionBox.style.zIndex = '';
        }

        ul.style.display = dropdownStatus ? 'block' : 'none';

        allDropdowns.forEach(nid => {
            if (id === nid) return;

            let optionBox = $('#' + nid + '-div');
            let ul = $('#' + nid);

            optionBox.className = optionBox.className.replace(/ opened/g, '');
            ul.style.zIndex = '';
            optionBox.style.zIndex = '';
            ul.style.display = 'none';
        });
    }

    optionBox.on('click', toggleDropdown);

    let options = Array.from(newUl.querySelectorAll('li'));

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

    let container = document.createElement('div');

    container.id = id + '-container';

    container.appendChild(optionBox);
    container.appendChild(newUl);

    ul.parentElement.insertBefore(container, ul);
    ul.parentElement.removeChild(ul);

    ul = newUl;

    ul.style.display = 'none';

    if (!allDropdowns.includes(id))
        allDropdowns.push(id);
}
