require('mapbox.js'); // attaches to window.L

var createElement = require('virtual-dom/create-element')
var chooseRoute = require('./lib/choose-route.js');
var fetchElevation = require('./lib/fetch-elevation.js');
var profile = require('./lib/profile.js');
var waypoints = require('./lib/waypoints.js')

var centerline = require('./data/centerline-merged.json');
var shelters = require('./data/at_shelters.json')
require('./app.css');

L.mapbox.accessToken = 'pk.eyJ1IjoiYW5hbmR0aGFra2VyIiwiYSI6InJJSEp4RFkifQ.Ea75OuvCgvTqmnYwq6udeg';

var map = L.mapbox.map('map', 'anandthakker.99416d58')
  .setView([45.93587, -68.92822265625], 8);

var trailLayer = L.mapbox.featureLayer(centerline)
  .addTo(map);

chooseRoute(map, centerline, routeChanged)

function routeChanged (route) {
  var shlt = waypoints(route, shelters.features)
  
  fetchElevation(route, function(err, elevation) {
    if(err) console.error(err)
    var chart = profile(route, elevation, shlt)
    var el = document.getElementById('profile')
    el.innerHTML = ''
    el.appendChild(createElement(chart))
  })
}

