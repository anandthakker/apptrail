require('mapbox.js'); // attaches to window.L

var chooseRoute = require('./lib/choose-route.js');
require('./app.css');

L.mapbox.accessToken = 'pk.eyJ1IjoiYW5hbmR0aGFra2VyIiwiYSI6InJJSEp4RFkifQ.Ea75OuvCgvTqmnYwq6udeg';

var map = L.mapbox.map('map', 'anandthakker.99416d58')
  .setView([45.93587, -68.92822265625], 8);

var centerline = require('./data/centerline-merged.json');
var trailLayer = L.mapbox.featureLayer(centerline).addTo(map);


chooseRoute(map, centerline, function(route){
  console.log('route', route)
})

