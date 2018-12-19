function toggle(busStopCode) {
    let div = $(`div.service-info[bus-stop="${busStopCode}"]`);

    if (div.style.display === 'none')
        div.style.display = 'flex';
    else
        div.style.display = 'none';
}

function calculateStudentFare(distance, mode, service) {
    if (mode === 'card') {
        if (service === 'feeder')
            return 37;
        if (service === 'basic' || service === 'mrt') {
            if (distance <= 3.2)
                return 37;
            else if (distance <= 4.2)
                return 42;
            else if (distance <= 5.2)
                return 47;
            else if (distance <= 6.2)
                return 52;
            else if (distance <= 7.2)
                return 55;
            else return 58;
        } else if (service === 'express')
            return calculateStudentFare(distance, mode, 'basic') + 30;
    }
}

function calculateAdultFare(distance, mode, service) {
    if (mode === 'card') {
        if (service === 'feeder')
            return 77;
        if (service === 'basic' || service === 'mrt') {
            if (distance <= 3.2)
                return 77;
            else if (distance <= 4.2)
                return 87;
            else if (distance <= 5.2)
                return 97;
            else if (distance <= 6.2)
                return 107;
            else if (distance <= 7.2)
                return 116;
            else if (distance <= 8.2)
                return 123;
            else if (distance <= 9.2)
                return 129;
            else if (distance <= 10.2)
                return 133;
            else if (distance <= 11.2)
                return 137;
            else if (distance <= 12.2)
                return 141;
            else if (distance <= 13.2)
                return 145;
            else if (distance <= 14.2)
                return 149;
            else if (distance <= 15.2)
                return 153;
            else if (distance <= 16.2)
                return 157;
            else if (distance <= 17.2)
                return 161;
            else if (distance <= 18.2)
                return 165;
            else if (distance <= 19.2)
                return 169;
            else if (distance <= 20.2)
                return 172;
            else if (distance <= 21.2)
                return 175;
            else if (distance <= 22.2)
                return 178;
            else if (distance <= 23.2)
                return 181;
            else if (distance <= 24.2)
                return 183;
            else if (distance <= 25.2)
                return 185;
            else if (distance <= 26.2)
                return 187;
            else if (distance <= 27.2)
                return 188;
            else if (distance <= 28.2)
                return 189;
            else if (distance <= 29.2)
                return 190;
            else if (distance <= 30.2)
                return 191;
            else if (distance <= 31.2)
                return 192;
            else if (distance <= 32.2)
                return 193;
            else if (distance <= 33.2)
                return 194;
            else if (distance <= 34.2)
                return 195;
            else if (distance <= 35.2)
                return 196;
            else if (distance <= 36.2)
                return 197;
            else if (distance <= 37.2)
                return 198;
            else if (distance <= 38.2)
                return 199;
            else if (distance <= 39.2)
                return 200;
            else if (distance <= 40.2)
                return 201;
            else return 202
        } else if (service === 'express') {
            return calculateAdultFare(distance, mode, 'basic') + 60;
        }
    }
}

function calculateSeniorFare(distance, mode, service) {
    if (mode === 'card') {
        if (service === 'feeder')
            return 54;
        if (service === 'basic' || service === 'mrt') {
            if (distance <= 3.2)
                return 54;
            else if (distance <= 4.2)
                return 61;
            else if (distance <= 5.2)
                return 68;
            else if (distance <= 6.2)
                return 75;
            else if (distance <= 7.2)
                return 81;
            else return 87;
        } else if (service === 'express') {
            return calculateSeniorFare(distance, mode, 'basic') + 45;
        }
    }
}

function calculateFare(distance, type, mode, service) {
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

    let farePopupShowing = false;

    let fareType = destBusStop = startBusStop = null;

    window.calcFarePopup = function calcFarePopup(stopNumber) {
        farePopupShowing = !farePopupShowing;

        if (farePopupShowing) {
            $('#shade').style.display = 'flex';
            $('#fare-box-container').style.display = 'block';
            $('html').style.overflow = 'hidden';
            update();
        } else {
            $('#shade').style.display = 'none';
            $('#fare-box-container').style.display = 'none';
            $('html').style.overflow = 'scroll';
        }

        if (stopNumber !== null) {
            $(`#start-bus-stop li:nth-child(${stopNumber + 1})`).setAttribute('selected', true);
            startBusStop = busStops[stopNumber].distance;
            $('#start-bus-stop-div span').textContent = busStops[stopNumber].busStopName;
        }
    }

    function calculate() {
        if (destBusStop - startBusStop <= 0)
            return null;
        if (!fareType || destBusStop === null || startBusStop === null)
            return null;
        return '$' + calculateFare(destBusStop - startBusStop, fareType, 'card', 'basic') / 100;
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
});











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
