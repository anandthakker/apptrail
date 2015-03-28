var h = require('virtual-hyperscript-svg')
var distance = require('turf-distance')
var point = require('turf-point')
var bs = require('binary-search-bounds')

module.exports = function(route, elevation, shelters) {
  elevation = elevation.filter(function(d) { return d.ele })

  // calculate distance along the trail for each point, to be used as the x-coordinate
  // of the profile chart
  var prev = elevation[0]
  var soFar = 0
  elevation.forEach(function(d) {
    soFar += distance(point([ prev.latlng.lng, prev.latlng.lat ]),
      point([ d.latlng.lng, d.latlng.lat ]))
    d.trailDistance = soFar
    prev = d
  })

  // scales
  var maxElevation = Math.max.apply(null, elevation.map(function(d) {return d.ele}))
  var y = scale([0, maxElevation], [300,0])
  var x = scale(extremes(elevation.map(function(d) {return d.trailDistance})), [0,1200])

  // format point string for trail profile
  var trailPoints = elevation
      .map(function(d) { return x(d.trailDistance) + ',' + y(d.ele) })
      .join(' ')

  // get elevation given a certain distance along the trail...
  function getElevation(s) {
    var i = bs.le(elevation, s, function(a, target) {
      return a.trailDistance - target
    })
    console.log('bs result:', elevation[i])
    return elevation[i].ele
  }

  // labels for shelters along the trail
  var shelterLabels = shelters.map(function(d) {
    return h('text', {
      x: x(d.fromStart),
      y: y(getElevation(d.fromStart)),
      'text-anchor': 'start'
    }, d.point.properties.NAME)
  })
  console.log(shelterLabels)
  var children = []
  children.push(h('polyline', {
    class: 'trail',
    fill: 'none',
    points: trailPoints
  }))
  children.push.apply(children, shelterLabels)

  return h('svg', { viewBox: '0 0 1200 300', preserveAspectRatio: 'none' }, children)
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
