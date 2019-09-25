const request = require('request-promise')
const crypto = require('crypto')
const TimedCache = require('timed-cache')
const moment = require('moment')
require('moment-timezone')

const lines = require('./lines.json')

const departuresCache = new TimedCache({ defaultTtl: 1000 * 60 * 1 })

const host = 'connectv3.smrt.wwprojects.com'
const hashKey = 'q/t+NNAkQZNlq/aAD6PlexImwQTxwgT2MahfTa9XRLA='

const hawkKey = 'h42325aqx6krj5z2uzm5e8wwqr2wchk5xq704n1e'

let lineDestinations = {
  'East West Line': ['Pasir Ris', 'Boon Lay', 'Joo Koon', 'Tuas Link'],
  'Changi Airport Line': ['Tanah Merah', 'Changi Airport'],
  'North South Line': ['Jurong East', 'Kranji', 'Ang Mo Kio', 'Marina Bay', 'Marina South Pier'],
  'Circle Line': ['Dhoby Ghaut', 'Stadium', 'Pasir Panjang', 'one-north', 'Caldecott', 'Tai Seng', 'Mountbatten', 'HarbourFront', 'Marina Bay']
}

function genRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
}

function getBaseString(path, timestamp, method, hash, nonce) {
  return `hawk.1.header
${timestamp}
${nonce}
${method}
${path}
${host}
443
${hash}

`
}

function getMAC(baseString) {
  let hmac = crypto.createHmac('sha256', hawkKey)
  hmac.write(baseString)
  hmac.end()

  return Buffer.from(hmac.read()).toString('base64')
}

async function getDepartures(stationCode) {
  if (departuresCache.get(stationCode)) return departuresCache.get(stationCode)
  let timestamp = (new Date() / 1000 | 0) + 700
  let nonce = genRandomString(12).toUpperCase()

  let path = `/smrt/api/train_arrival_time_by_id/?station=${encodeURI(stationCode)}`
  let baseString = getBaseString(path, timestamp, 'GET', hashKey, nonce)
  let mac = getMAC(baseString)

  let headers = {
    'Connection': 'Keep-Alive',
    'User-Agent': 'SMRT Connect/3.0 Android/7.0',
    'Connection': 'Keep-Alive',
    'Content-Type': 'text/plain',
    'Referer': 'https://connectv3.smrt.wwprojects.com/smrt/',
    'Authorization': `Hawk id="ww-connectv3-android",mac="${mac}",hash="${hashKey}",ts="${timestamp}",nonce="${nonce}"`
  }

  let url = 'https://' + host + path
  let body = JSON.parse(await request({
    method: 'GET',
    url,
    headers,
    gzip: true
  }))

  let departures = []

  body.results.forEach(platform => {
    let minToFirstTrain = platform.next_train_arr
    if (minToFirstTrain === 'Arr') minToFirstTrain = 1

    let minToNextTrain = platform.subseq_train_arr
    if (minToNextTrain === 'Arr') minToNextTrain = 1

    let routeName
    Object.keys(lineDestinations).forEach(line => {
      if (lineDestinations[line].includes(platform.next_train_destination))
        routeName = line
    })

    let codedLineName = routeName.toLowerCase().replace(/[^\w\d ]/g, '-').replace(/  */g, '-').replace(/--+/g, '-')

    let platformNumber = platform.platform_ID.slice(-1)
    let isCCLPlatform = platform.platform_ID.length === 6

    let firstTrain = {
      departureTime: moment().tz('Asia/Singapore').add(minToFirstTrain, 'minutes'),
      platform: platformNumber,
      isCCLPlatform,
      destination: platform.next_train_destination,
      routeName,
      codedLineName
    }

    let nextTrain = {
      departureTime: moment().tz('Asia/Singapore').add(minToNextTrain, 'minutes'),
      platform: platformNumber,
      isCCLPlatform,
      destination: platform.subseq_train_destination,
      routeName,
      codedLineName
    }

    departures.push(firstTrain)
    departures.push(nextTrain)
  })

  departures.sort((a, b) => a.departureTime - b.departureTime).map(departure => {
    let {routeName, destination} = departure
    let lineData = lines.filter(line => line.routeName === routeName)[0]

    let lineStops = lineData.stops.map(stop => stop.stopName)

    let startingIndex = lineStops.indexOf(stationCode)
    let endingIndex = lineStops.indexOf(destination)

    if (startingIndex > endingIndex) {
      lineStops.reverse()
      startingIndex = lineStops.indexOf(stationCode)
      endingIndex = lineStops.indexOf(destination)
    }

    let stopsAt = lineStops.slice(startingIndex, endingIndex + 1)
    departure.stopsAt = stopsAt

    return departure
  })

  departuresCache.put(stationCode, departures)
  return departures
}

module.exports = getDepartures
