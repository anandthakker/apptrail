// Sort the lines in a featurecollection into a geographically sensible order,
// then merge them into a single feature (w/ a LineString geometry).

var fs = require('fs')
var flatten = require('./flatten')
var traceOne = require('./trace')
var insertOne = require('./insert')

var lineCollection = JSON.parse(fs.readFileSync(process.argv[2]))

var flatInput = flatten(lineCollection)
var sorted = { type: 'FeatureCollection', properties: {}, features: [] }

var trace = true
var log = process.argv[3] === '-v'

while(flatInput.features.length > 0) {
  var result = (trace ? traceOne : insertOne)(flatInput, sorted)
  var loc = [].concat(result.feature.geometry.coordinates[0]).reverse()

  if(result.distance > 1) {
    if(trace) flatInput.features.push(sorted.features.pop())
    trace = false
  }
  if(log) console.error(trace ? 'trace' : 'insert', result, flatInput, sorted)
}

process.stdout.write(JSON.stringify(mergeLines(sorted)))

// takes a featurecollection of LineString features and zips 'em up, in order
// into a single feature.
function mergeLines (fc) {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: Array.prototype.concat.apply([], fc.features.map(function coords (feat) {
        return feat.geometry.coordinates
      }))
    }
  }
}
