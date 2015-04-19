var h = require('virtual-hyperscript-svg')
var distance = require('turf-distance')
var point = require('turf-point')
var bs = require('binary-search-bounds')

module.exports = function renderProfile (route, elevation, shelters) {
  elevation = elevation.filter(function (d) { return d.ele })

  // calculate distance along the trail for each point, to be used as the x-coordinate
  // of the profile chart
  var prev = elevation[0]
  var soFar = 0
  elevation.forEach(function (d) {
    soFar += distance(point([ prev.latlng.lng, prev.latlng.lat ]),
      point([ d.latlng.lng, d.latlng.lat ]), 'miles')
    d.trailDistance = soFar
    prev = d
  })

  // scales
  var maxElevation = Math.max.apply(null, elevation.map(function (d) {return d.ele}))
  var maxDistance = Math.max.apply(null, elevation.map(function (d) {return d.trailDistance}))
  var y = scale([0, maxElevation], [300, 0])
  var x = scale([0, maxDistance], [0, 1200])

  // format point string for trail profile
  var trailPoints = elevation
    .map(function (d) { return x(d.trailDistance) + ',' + y(d.ele) })
    .join(' ')

  var children = [].concat(
    mileMarkers(),
    h('polyline', {
      class: 'trail',
      points: trailPoints
    }),
    shelterLabels()
  )

  return h('svg', { viewBox: '0 0 1200 300', preserveAspectRatio: 'none' }, children)

  // draw shelter labels, positioned at correct elevation on the profile chart
  function shelterLabels () {
    return shelters.map(function (d) {
      return h('text', {
        x: x(d.fromStart),
        y: y(getElevation(elevation, d.fromStart)),
        'text-anchor': 'start'
      }, d.point.properties.NAME)
    })
  }

  function mileMarkers () {
    return range(0, maxDistance).map(function tick (mile) {
      return h('line', {
        class: 'mile-marker',
        x1: x(mile),
        y1: y(0),
        x2: x(mile),
        y2: y(maxElevation)
      })
    })
  }
}

// get elevation given a certain distance along the trail...
function getElevation (elevation, s) {
  // callback to bs.le always passes 's' as the second argument
  var i = bs.le(elevation, s, function (a, target) {
    return a.trailDistance - target
  })
  return elevation[i].ele
}

function range (low, high, by) {
  by = by || 1
  var arr = []
  for (var x = low; x < high; x += by) {
    arr.push(x)
  }
  return arr
}

// Return a function that is a linear mapping of the interval (domain[0], domain[1])
// to the interval (range[0], range[1]).
function scale (domain, range) {
  var m = (range[1] - range[0]) / (domain[1] - domain[0])
  var b = range[0] - m * domain[0]
  return function _scale (domainValue) {
    return domainValue * m + b
  }
}
