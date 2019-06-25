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
                url: '/bus/stops/' + $('#bus-stop-code').value
            }, function(data) {
                $('#stop-container').innerHTML = data;
            });
        }

    });
});
