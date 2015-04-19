var featurecollection = require('turf-featurecollection')
var point = require('turf-point')
var pointOnLine = require('turf-point-on-line')
var slice = require('turf-line-slice')
var nearest = require('turf-nearest')
var distance = require('turf-distance')
var length = require('turf-line-distance')

// line - a LineString feature
// points - an array of Point features
// radius - filter out points that are farther than `radius` from the given line
// return - array of {point,location}, where location is the distance along
// `line` where the `point` is located
module.exports = function waypoints (line, points, radius) {
  radius = typeof radius === 'undefined' ? 1 : radius
  // filter points < 1 mile
  points = featurecollection(points.filter(function (p) {
    return distance(p, pointOnLine(line, p)) < radius
  }))

  var sections = []
  var prev = point(line.geometry.coordinates[0])
  while(points.features.length > 0) {
    // find and remove nearest next point
    var next = nearest(prev, points)
    points.features.splice(points.features.indexOf(next), 1)

    // get trail distance from previous point to current one
    var trailSection = slice(prev, next, line)
    var delta = length(trailSection)

    var soFar = sections.length === 0 ? delta : sections[sections.length - 1].fromStart
    sections.push({
      point: next,
      fromPrevious: delta,
      fromStart: soFar + delta,
    })

    prev = next
  }

  return sections
}
