var h = require('virtual-hyperscript-svg')

module.exports = function(route, elevation, shelters) {
  elevation = elevation.map(function (d) { return d.ele })
  console.log('profile', route, elevation, shelters)
  var elevationDomain = [
    Math.min.apply(null, elevation),
    Math.max.apply(null, elevation)
  ]

  var pointString = elevation.map(scale(elevationDomain, [0,100]))
      .map(function(e, i) { return (i/elevation.length)*100 + ',' + e })
      .join(' ')
  console.log(pointString)

  return h('svg', { viewBox: '0 0 100 100' }, [
    h('polyline', {
      fill: 'none',
      stroke: 'black',
      points: pointString
    })
  ])
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
