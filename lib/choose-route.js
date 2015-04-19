var pointOnLine = require('turf-point-on-line')
var point = require('turf-point')
var featurecollection = require('turf-featurecollection')
var lineSlice = require('turf-line-slice')

module.exports = function (map, centerline, routeChanged) {
  var freeMarker = L.marker([42.9, -73.10], {
    icon: L.mapbox.marker.icon({
      'marker-color': '#f86767'
    })
  })
    .addTo(map)

  map.on('mousemove', function updateFreeMarker (e) {
    var near = pointOnLine(centerline, point([e.latlng.lng, e.latlng.lat]))
    freeMarker.setLatLng([].concat(near.geometry.coordinates).reverse())
  })

  var endpoints = featurecollection([])
  var endpointsLayer = L.mapbox.featureLayer(endpoints).addTo(map)
  var trailLayer = L.mapbox.featureLayer({
    type: 'Feature',
    properties: {},
    geometry: {type: 'LineString', coordinates: []}
  })
    .addTo(map)

  map.on('click', function click (e) {
    switch (endpoints.features.length) {
      case 0:
        endpoints.features.push(freeMarker.toGeoJSON())
        break
      case 1:
        endpoints.features.push(freeMarker.toGeoJSON())
        map.removeLayer(freeMarker)
        var trail = lineSlice(endpoints.features[0], endpoints.features[1], centerline)
        trailLayer.setGeoJSON(trail)
          .setStyle({color: '#03f'})
        routeChanged(trail)
        break
    }
    endpointsLayer.setGeoJSON(endpoints)
  })

  endpointsLayer.on('click', function changeRoute (e) {
    endpointsLayer.removeLayer(e.layer)
    endpoints = endpointsLayer.toGeoJSON()
    map.addLayer(freeMarker)
    console.log(endpoints.features.length)
  })
}
