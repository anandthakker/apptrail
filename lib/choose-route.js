var pointOnLine = require('turf-point-on-line');
var point = require('turf-point');
var featurecollection = require('turf-featurecollection');
var nearest = require('turf-nearest');

module.exports = function(map, centerline, routeChanged){
  var freeMarker = L.marker([42.9, -73.10], {
    icon: L.mapbox.marker.icon({
      'marker-color': '#f86767'
    })
  })
  .addTo(map);

  map.on('mousemove', function updateFreeMarker (e) {
    var near = pointOnLine(centerline, point([e.latlng.lng, e.latlng.lat]));
    freeMarker.setLatLng([].concat(near.geometry.coordinates).reverse());
  });

  var route = featurecollection([]);
  var routeLayer = L.mapbox.featureLayer(route).addTo(map);

  map.on('click', function click(e) {
    switch(route.features.length) {
      case 0:
        route.features.push(freeMarker.toGeoJSON())
        break
      case 1:
        route.features.push(freeMarker.toGeoJSON())
        map.removeLayer(freeMarker)
        routeChanged(route)
        break
    }
    routeLayer.setGeoJSON(route)
  });

  routeLayer.on('click', function changeRoute(e) {
    routeLayer.removeLayer(e.layer)
    route = routeLayer.toGeoJSON()
    map.addLayer(freeMarker)
    console.log(route.features.length)
  })
}
