function toggle(busStopCode) {
    let div = $(`div.service-info[bus-stop="${busStopCode}"]`);

    if (div.style.display === 'none')
        div.style.display = 'flex';
    else
        div.style.display = 'none';
}
