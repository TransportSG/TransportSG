$.ready(() => {
    $.ajax({
        url: '/mrt/disruptions',
        method: 'POST'
    }, (status) => {
        if (status && status.status === 'disrupted') {
            $('#disruption').textContent = `
                #header {
                     background-color: #e42323 !important;
                }
            `;

            $('#mrt-disruptions').style.display = '';
        }
    });
});
