var h = require('virtual-hyperscript-svg')
var distance = require('turf-distance')
var point = require('turf-point')
module.exports = function(route, elevation, shelters) {
  elevation = elevation.filter(function(d) { return d.ele })

  var prev = elevation[0]
  var soFar = 0
  elevation.forEach(function(d) {
    soFar += distance(point([ prev.latlng.lng, prev.latlng.lat ]),
      point([ d.latlng.lng, d.latlng.lat ]))
    d.trailDistance = soFar
    prev = d
  })

  var y = scale(extremes(elevation.map(function(d) {return d.ele})), [100,0])
  var x = scale(extremes(elevation.map(function(d) {return d.trailDistance})), [0,100])

  var pointString = elevation
      .map(function(d) { return x(d.trailDistance) + ',' + y(d.ele) })
      .join(' ')

  return h('svg', { viewBox: '0 0 100 100', preserveAspectRatio: 'none' }, [
    h('polyline', {
      fill: 'none',
      stroke: 'black',
      points: pointString
    })
  ])
}

function extremes(arr) {
  return [
    Math.min.apply(null, arr),
    Math.max.apply(null, arr)
  ]
}

// x -> (x-d[0])*m + r[0]
// == mx + (r[0] - m*d[0])
function scale (domain, range) {
  var m = (range[1] - range[0])/(domain[1] - domain[0])
  var b = range[0] - m * domain[0]
  return function _scale(domainValue) {
    return domainValue * m + b
  }
}
