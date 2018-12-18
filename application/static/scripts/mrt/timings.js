let selectedLine = '';
let selectedStation = '';

$.ready(() => {
    createDropdown('lineSelector', line => {
        selectedLine = line;
        let stationSelectorStub = $('#stationSelectorStub');
        if (stationSelectorStub)
            stationSelectorStub.parentElement.removeChild(stationSelectorStub);

        let stationSelector = $('#stationSelector');
        stationSelector.innerHTML = stationData[line].stations.filter(station => station.operational !== false).map(station =>
            `<li>${station.stationNumber} ${station.stationName}</li>`
        ).join('');

        selectedStation = '';

        createDropdown('stationSelector', station => {
            selectedStation = station.split(' ').slice(1).join(' ');
        });
    });

    $('button').on('click', () => {
        if (selectedLine && selectedStation)
            location.pathname = `/timings/mrt/${selectedLine}/${selectedStation}`
    });
});
