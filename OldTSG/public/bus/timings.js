function bindEnter(query, button) {
    $(query).on('keydown', function(event) {
        if (event.keyCode === 13) 
            $(button).click();
    });
}

window.on('load', function() {
    bindEnter('#bus-stop-code', '#load');
    $('#load').on('click', function() {
        if (!$('#bus-stop-code').value) {
            $('#error').textContent = 'Please enter a valid bus stop code!';
        } else {
            $('#error').textContent = '';
            $.ajax({
                url: '/old/bus/timings/' + $('#bus-stop-code').value
            }, function(data) {
                $('#timings-container').innerHTML = data;
            });
        }
    });
    if (search.hash.stop) {
        $('#bus-stop-code').value = search.hash.stop;
        $('#load').click();
    }
});
