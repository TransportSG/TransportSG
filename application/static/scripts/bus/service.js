function toggle(stopNumber) {
    let div = $(`div.service-info[stop-number="${stopNumber}"]`);

    if (div.style.display === 'none')
        div.style.display = 'flex';
    else
        div.style.display = 'none';
}

function calculateStudentFare(distance, mode, service) {
    if (service === 'chinatown') return 110;
    if (mode === 'card') {
        if (service === 'feeder')
            return 38;
        if (service === 'basic' || service === 'mrt') {
            if (distance <= 3.2)
                return 38;
            else if (distance <= 4.2)
                return 43;
            else if (distance <= 5.2)
                return 48;
            else if (distance <= 6.2)
                return 53;
            else if (distance <= 7.2)
                return 56;
            else return 59;
        } else if (service === 'express')
            return calculateStudentFare(distance, mode, 'basic') + 30;
    }
}

function calculateAdultFare(distance, mode, service) {
    if (service === 'chinatown') return 200;
    if (mode === 'card') {
        if (service === 'feeder')
            return 83;
        if (service === 'basic' || service === 'mrt') {
            if (distance <= 3.2)
                return 83;
            else if (distance <= 4.2)
                return 93;
            else if (distance <= 5.2)
                return 103;
            else if (distance <= 6.2)
                return 113;
            else if (distance <= 7.2)
                return 122;
            else if (distance <= 8.2)
                return 129;
            else if (distance <= 9.2)
                return 135;
            else if (distance <= 10.2)
                return 139;
            else if (distance <= 11.2)
                return 143;
            else if (distance <= 12.2)
                return 147;
            else if (distance <= 13.2)
                return 151;
            else if (distance <= 14.2)
                return 155;
            else if (distance <= 15.2)
                return 159;
            else if (distance <= 16.2)
                return 163;
            else if (distance <= 17.2)
                return 167;
            else if (distance <= 18.2)
                return 171;
            else if (distance <= 19.2)
                return 175;
            else if (distance <= 20.2)
                return 178;
            else if (distance <= 21.2)
                return 181;
            else if (distance <= 22.2)
                return 184;
            else if (distance <= 23.2)
                return 187;
            else if (distance <= 24.2)
                return 189;
            else if (distance <= 25.2)
                return 191;
            else if (distance <= 26.2)
                return 193;
            else if (distance <= 27.2)
                return 194;
            else if (distance <= 28.2)
                return 195;
            else if (distance <= 29.2)
                return 196;
            else if (distance <= 30.2)
                return 197;
            else if (distance <= 31.2)
                return 198;
            else if (distance <= 32.2)
                return 199;
            else if (distance <= 33.2)
                return 200;
            else if (distance <= 34.2)
                return 201;
            else if (distance <= 35.2)
                return 202;
            else if (distance <= 36.2)
                return 203;
            else if (distance <= 37.2)
                return 204;
            else if (distance <= 38.2)
                return 205;
            else if (distance <= 39.2)
                return 206;
            else if (distance <= 40.2)
                return 207;
            else return 208;
        } else if (service === 'express') {
            return calculateAdultFare(distance, mode, 'basic') + 60;
        }
    }
}

function calculateSeniorFare(distance, mode, service) {
    if (service === 'chinatown') return 110;
    if (mode === 'card') {
        if (service === 'feeder')
            return 55;
        if (service === 'basic' || service === 'mrt') {
            if (distance <= 3.2)
                return 55;
            else if (distance <= 4.2)
                return 62;
            else if (distance <= 5.2)
                return 69;
            else if (distance <= 6.2)
                return 76;
            else if (distance <= 7.2)
                return 82;
            else return 88;
        } else if (service === 'express') {
            return calculateSeniorFare(distance, mode, 'basic') + 45;
        }
    }
}

function calculateFare(distance, type, mode, service) {
    if (service === 'nightrider') return 450;
    switch(type) {
        case 'student':
            return calculateStudentFare(distance, mode, service);
            break;

        case 'senior':
            return calculateSeniorFare(distance, mode, service);
            break;

        case 'adult':
        default:
            return calculateAdultFare(distance, mode, service);
            break;
    }
}

$.ready(() => {
    loadDropdowns();
    switch(svcType) {
        case 'TRUNK':
        case 'INDUSTRIAL':
            svcType = 'basic';
            break;
        case 'TOWNLINK':
        case 'FEEDER':
            svcType = 'feeder';
            break;
        case 'EXPRESS':
        case 'CITY_LINK':
            svcType = 'express';
            break;
        case 'NIGHT RIDER':
            svcType = 'nightrider';
            break;
        case 'NIGHT OWL':
            svcType = 'nightowl';
            break;
        case 'CHINATOWN':
            svcType = 'chinatown';
            break;
        default:
            svcType = 'basic';
            break;
    }

    let farePopupShowing = false;

    let fareType = destBusStop = startBusStop = null;

    window.calcFarePopup = function calcFarePopup(stopNumber) {
        farePopupShowing = !farePopupShowing;

        if (farePopupShowing) {
            $('#shade').style.display = 'flex';
            $('#fare-box-container').style.display = 'block';
            $('html').style.overflow = 'hidden';
        } else {
            $('#shade').style.display = 'none';
            $('#fare-box-container').style.display = 'none';
            $('html').style.overflow = 'scroll';
        }

        if (stopNumber !== null) {
            $(`#start-bus-stop li:nth-child(${stopNumber})`).setAttribute('selected', true);
            startBusStop = busStops[stopNumber - 1].distance;
            $('#start-bus-stop-div span').textContent = busStops[stopNumber - 1].busStopName;
            update();
        }
    }

    function calculate() {
        if (destBusStop - startBusStop <= 0)
            return null;
        if (!fareType || destBusStop === null || startBusStop === null)
            return null;
        return '$' + (calculateFare(destBusStop - startBusStop, fareType, 'card', svcType) / 100).toFixed(2);
    }

    function update() {
        let fare = calculate();
        if (!fare) {
            $('#fare-output').textContent = 'Invalid trip settings';
        } else {
            $('#fare-output').textContent = 'Your fare is: ' + fare;
        }
    }

    createDropdown('fare-type', newFareType => {
        fareType = newFareType.textContent.toLowerCase();
        update();
    });
    createDropdown('start-bus-stop', newStartBusStop => {
        startBusStop = newStartBusStop.getAttribute('distance') * 1;
        update();
    });
    createDropdown('dest-bus-stop', newDestBusStop => {
        destBusStop = newDestBusStop.getAttribute('distance') * 1;
        update();
    });

    $('#shade').on('click', () => {
        calcFarePopup(null);
    });

    Array.from(document.querySelectorAll('div.bookmark')).forEach(bookmarkDiv => {
        let busStopCode = bookmarkDiv.getAttribute('bus-stop-code');
        if (isBookmarked(busStopCode))
            bookmarkDiv.querySelector('img').src = '/static/images/bookmark/filled.svg';
    });
});


function checkStreetView(busStopCode) {
    $.ajax({
        url: `/bus/streetview/${busStopCode}`
    }, (status, url) => {
        window.open(url);
    });
}

function loadDropdowns() {
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

                onChange(option);
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
}

function toggleBookmark(busStopCode) {
    setBookmarked(busStopCode, !isBookmarked(busStopCode));
    $(`div[bus-stop-code="${busStopCode}"] img`).src =
        '/static/images/bookmark/' + (isBookmarked(busStopCode) ? 'filled' : 'empty') + '.svg';
}
