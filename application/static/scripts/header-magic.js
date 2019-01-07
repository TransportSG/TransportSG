$.ready(() => {
    $.ajax({
        url: '/mrt/disruptions',
        method: 'POST'
    }, (code, status) => {
        if (status) {
            if (status.status === 'disrupted') {
                $('#disruption').textContent = `
                    #header {
                         background-color: #e42323 !important;
                    }
                `;

                $('#mrt-disruptions').style.display = '';
            } else if (status.status === 'scheduled works') {
                $('#disruption').textContent = `
                    #header {
                         background-color: #d86321 !important;
                    }
                `;

                $('#mrt-disruptions').innerHTML = '<span>Scheduled</span><span>Works</span>';
                $('#mrt-disruptions').style.display = '';
            }
        }
    });
});
