var qs = require('querystring')
var hyperquest = require('hyperquest')
var polyline = require('polyline')
var concat = require('concat-stream')

var surfaceApi = 'https://api.tiles.mapbox.com/v4/surface/mapbox.mapbox-terrain-v1.json'
// this is the token from a mapbox blog example. don't know why mine doesn't work.
var surfaceToken = 'pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig'

module.exports = function fetchElevation (route, done){

  var section = route.geometry.coordinates
    .map(function(coord) { return [].concat(coord).reverse() })

  var profile = []
  // request 300 points at a time
  ;(function next (){
    if(section.length === 0) return done(null, profile)
    // GET surfaceApi?layer=contour&fields=ele&access_token=...&encoded_polyline=...
    var params = {
      layer: 'contour',
      fields: 'ele',
      access_token: surfaceToken,
      encoded_polyline: polyline.encode(section.splice(0,300))
    }
    hyperquest.get(surfaceApi + '?' + qs.stringify(params), {
      withCredentials: false
    })
    .on('error', done)
    .pipe(concat({encoding: 'string'}, function (data) {
      var result = JSON.parse(data)
      profile.push.apply(profile, result.results)
      next()
    }))
  })()
}
