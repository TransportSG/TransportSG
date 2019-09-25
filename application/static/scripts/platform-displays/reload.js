function formatTime(time) {
  let hours = time.getUTCHours() + 8
  let minutes = time.getMinutes()
  let mainTime = ''

  mainTime += (hours % 12) || 12
  mainTime += ':'
  if (minutes < 10) mainTime += '0'
  mainTime += minutes

  if (time.getHours() >= 12)
    mainTime += 'pm'
  else
    mainTime += 'am'

  return mainTime
}

function createStationRow(name, imgSource) {
  return `<div class="stationRow">
  <img src="/static/images/platform-displays/station-${imgSource}.svg"/>
  <p class="${imgSource}">${name}</p>
</div>`
}

setInterval(() => {
  $.ajax({
    method: 'POST'
  }, (status, body) => {
    let {departures} = body
    if (!departures.length) return

    departures = departures.map(departure => {
      departure.departureTime = new Date(departure.departureTime)
      const timeDifference = Math.round((departure.departureTime - new Date()) / 1000 / 60)

      if (+timeDifference <= 0) departure.prettyTimeToDeparture = 'NOW'
      else {
        departure.prettyTimeToDeparture = timeDifference + ' min'
      }
      return departure
    }).sort((a, b) => a.departureTime - b.departureTime)

    let firstDeparture = departures[0]

    $('.topLineBanner').className = 'topLineBanner ' + firstDeparture.codedLineName
    $('.firstDepartureInfo .scheduledDepartureTime').textContent = formatTime(firstDeparture.departureTime)
    $('.firstDepartureInfo .destination').textContent = firstDeparture.destination
    $('.firstDepartureInfo .platform').className = 'platform ' + firstDeparture.codedLineName
    $('.firstDepartureInfo .platform span').textContent = firstDeparture.platform
    $('.firstDepartureInfo .timeToDeparture span').textContent = firstDeparture.prettyTimeToDeparture
    $('.stoppingAt').className = 'stoppingAt ' + firstDeparture.codedLineName

    let first17Stations = firstDeparture.stopsAt.slice(0, 17)
    let next17Stations = firstDeparture.stopsAt.slice(17)

    let stoppingHTML = `<div>` // left
    stoppingHTML += createStationRow(' ', 'express')
    let hasTerminating = firstDeparture.stopsAt.length <= 17
    stoppingHTML += `<div class="stationRow">
      <img src="/static/images/platform-displays/station-stops-at.svg" class="${firstDeparture.codedLineName}"/>
      <p class="${firstDeparture.codedLineName}">${first17Stations[0]}</p>
    </div>`
    for (station of first17Stations.slice(1, hasTerminating ? -1 : 17))
      stoppingHTML += createStationRow(station, 'stops-at')

    if (hasTerminating)
      stoppingHTML += createStationRow(first17Stations.slice(-1)[0], 'terminates')
    else
      stoppingHTML += createStationRow(' ', 'filler')

    stoppingHTML += `</div><div>` // right
    if (next17Stations.length) {
      stoppingHTML += createStationRow(' ', 'filler')
      for (station of next17Stations.slice(0, -1))
        stoppingHTML += createStationRow(station, 'stops-at')
      stoppingHTML += createStationRow(next17Stations.slice(-1)[0], 'terminates')
    }
    stoppingHTML += `</div>`

    let containerDIV = document.createElement('div')
    containerDIV.innerHTML = stoppingHTML
    setTimeout(() => {
      $('.stoppingAt').innerHTML = ''
      $('.stoppingAt').appendChild(containerDIV)
    }, hasTerminating ? 100 : 200)


    let departureDIVs = Array.from(document.querySelectorAll('.smallDeparture'))
    departures.concat([null, null, null, null]).slice(1, 5).forEach((departure, i) => {
      let departureDIV = departureDIVs[i]
      if (!!departure) {
        $('.sideBar', departureDIV).className = 'sideBar ' + departure.codedLineName
        $('.sideBar~p', departureDIV).textContent = formatTime(departure.departureTime)

        $('.centre p', departureDIV).textContent = departure.destination

        $('.right .platform', departureDIV).className = 'platform ' + departure.codedLineName
        $('.right .platform p', departureDIV).textContent = departure.platform

        $('.right .timeToDeparture p', departureDIV).textContent = departure.prettyTimeToDeparture.replace(' ', '')
      } else {
        $('.sideBar', departureDIV).className = 'sideBar no-line'
        $('.sideBar~p', departureDIV).textContent = '--'

        $('.centre p', departureDIV).textContent = '--'

        $('.right .platform', departureDIV).className = 'platform no-line'
        $('.right .platform p', departureDIV).innerHTML = '&nbsp;'

        $('.right .timeToDeparture p', departureDIV).innerHTML = '&nbsp;'
      }
    })
  })
}, 1000 * 15)
