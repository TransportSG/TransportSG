const express = require('express');
const router = new express.Router();
const stations = require('./stations.json')
const getDepartures = require('./get-next-train')

router.get('/:station', async (req, res) => {
  let station = stations.filter(station => station.codedStopName === req.params.station)[0]
  let departures = await getDepartures(station.stopName)

  if (!departures.length) return res.end('no departure need to do that screen')
  res.render('platform-displays', { departures, bodyOnly: false })
})

router.post('/:station', async (req, res) => {
  let station = stations.filter(station => station.codedStopName === req.params.station)[0]
  let departures = await getDepartures(station.stopName)

  res.json({departures});
})

module.exports = router
