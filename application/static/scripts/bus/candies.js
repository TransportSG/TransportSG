function canSplit() {
    return window.innerWidth >= 700;
}

function dirClick(direction) {
    if (canSplit()) return;

    $(`#dir-${direction}`).className='active';
    $(`#dir-${3 - direction}`).className='';

    let serviceContainer = $('.serviceContainer[active]');
    let activeDirection = serviceContainer.querySelector(`.serviceDirectionContainer[direction="${direction}"]`);
    activeDirection.setAttribute('active', '');
    activeDirection.style.display = 'block';

    let inactiveDirection = serviceContainer.querySelector(`.serviceDirectionContainer[direction="${3 - direction}"]`);
    inactiveDirection.removeAttribute('active');
    inactiveDirection.style.display = 'none';
}

function setActive(service) {
    Array.from(document.querySelectorAll('.serviceContainer')).forEach(serviceContainer => {
        serviceContainer.style.display = 'none';
        Array.from(serviceContainer.children).forEach(direction => direction.style.display = 'none');
        serviceContainer.removeAttribute('active');
    });

    let serviceContainer = $(`.serviceContainer[service="${service}"]`);
    serviceContainer.style.display = 'flex';
    serviceContainer.setAttribute('active', '');
    let directionCount = serviceContainer.getAttribute('directions')*1;

    Array.from(serviceContainer.children).forEach(direction => direction.style.display = 'block');

    if (directionCount === 1) {
        $('#dir-2').style.display = 'none';
    } else {
        $('#dir-2').style.display = 'flex';
    }
}

function populate() {
    let serviceSelector = $('#service-selector');
    serviceSelector.on('change', () => {
        let selectedService = serviceSelector.selectedOptions[0].text;
        setActive(selectedService);
    });

    Array.from(document.querySelectorAll('.serviceContainer')).forEach(serviceContainer => {
        serviceContainer.setAttribute('directions', serviceContainer.children.length);
    });

    setActive(serviceSelector.selectedOptions[0].text);

    $('#dir-1').on('click', () => dirClick(1));
    $('#dir-2').on('click', () => dirClick(2));

    updateDisplay();
}

function updateDisplay() {
    let serviceContainer = $('.serviceContainer[active]');
    let directionCount = serviceContainer.getAttribute('directions')*1;

    if (directionCount === 1) {
        $('#dir-2').style.display = 'none';
    } else {
        $('#dir-2').style.display = 'flex';
    }

    if (!canSplit() && directionCount === 2) {
        let activeDirection = serviceContainer.querySelector('.serviceDirectionContainer[active]');
        if (!activeDirection)
            activeDirection = serviceContainer.children[0];

        activeDirection.setAttribute('active', '');
        let inactiveDirection = serviceContainer.querySelector('.serviceDirectionContainer:not([active])');
        inactiveDirection.removeAttribute('active');

        inactiveDirection.style.display = 'none';

        dirClick(activeDirection.getAttribute('direction'));
    }

    if (canSplit() && directionCount == 2)
        Array.from(serviceContainer.children).forEach(direction => direction.style.display = 'block');

    if (canSplit()) {
        $(`#dir-1`).className = '';
        $(`#dir-2`).className = '';
    }
}

function performQuery() {
    let query = $('#input').value;
    if (query.trim() ==  '') {
        $('#results').innerHTML = '';
        return;
    };

    $('#loading').style.display = 'block';

    $.ajax({
        method: 'POST',
        data: {
            query
        }
    }, (status, content) => {
        $('#loading').style.display = 'none';

        if (content) $('#results').innerHTML = content;

        populate();
        if (tag) tag();
    });
}

$.ready(() => {
    let inputTimeout = 0;

    let input = $('#input');

    input.on('input', () => {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(performQuery, 650);
    });

    performQuery();

    window.on('resize', updateDisplay);
});

function getTimingsDifference(a, b) {
    let d = new Date(Math.abs(a - b));
    return {minutes: d.getUTCMinutes(),seconds: d.getUTCSeconds()};
};
function hasArrived(timing) {
    return +new Date() - +new Date(timing) > 0;
}

function setTimes() {
    let now = new Date();

    Array.from(document.querySelectorAll('.bus-arrival')).forEach(div => {
        let arrivalTime = new Date(div.getAttribute('arrival'));
        let difference = getTimingsDifference(arrivalTime, now);

        if (hasArrived(arrivalTime)) {
            div.children[0].textContent = 'Arr';
            div.children[0].className = 'bus-arr';
            div.children[1].textContent = '';
        } else {
            div.children[0].textContent = difference.minutes;
            div.children[1].textContent = difference.seconds;
        }
    });
}

setInterval(setTimes, 1000);
