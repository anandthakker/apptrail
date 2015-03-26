require('mapbox.js'); // attaches to window.L

var createElement = require('virtual-dom/create-element')
var chooseRoute = require('./lib/choose-route.js');
var fetchElevation = require('./lib/fetch-elevation.js');
var profile = require('./lib/profile.js');

require('./app.css');

L.mapbox.accessToken = 'pk.eyJ1IjoiYW5hbmR0aGFra2VyIiwiYSI6InJJSEp4RFkifQ.Ea75OuvCgvTqmnYwq6udeg';

var map = L.mapbox.map('map', 'anandthakker.99416d58')
  .setView([45.93587, -68.92822265625], 8);

var centerline = require('./data/centerline-merged.json');
var trailLayer = L.mapbox.featureLayer(centerline).addTo(map);

chooseRoute(map, centerline, routeChanged)

function routeChanged (route) {
  fetchElevation(route, function(err, elevation) {
    console.log(err, elevation)
    if(err) console.error(err)
    var chart = profile(route, elevation)
    var el = document.getElementById('profile')
    el.appendChild(createElement(chart))
  })
}


function locateShelters (route) {
  var waypoints = require('./lib/waypoints.js')
  var shelters = require('./data/at_shelters.json')
  var data = waypoints(route, shelters.features)

  console.log(data)
  document.getElementById('profile').innerHTML = JSON.stringify(data)

  L.mapbox.featureLayer(data)
  .eachLayer(function (marker) {
    marker.setIcon(L.mapbox.marker.icon({'marker-color': '#0a8'}))
  })
  .addTo(map)
}

