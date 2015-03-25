var fs = require('fs');
var end = require('./util').end;
var dist = require('./util').distance;
var segdist = require('./util').segmentDistance;
var northernmost = require('./util').northernmost;

// find the segment in inputLine that's closest to the tail end of result, and
// append it.
module.exports = function sortOne(inputLine, result) {
  inputLine = inputLine.features;
  result = result.features; 
  
  if(result.length === 0) {
    var northern = northernmost(inputLine);
    result.push(inputLine.splice(northern.i, 1)[0]); 
    return {distance: 0, feature: end(result)};
  }
  
  var northern = end(result)
  var nearest = inputLine.reduce(function closest (best, feat, i) {
    var seg = feat.geometry.coordinates
    var d = segdist(northern.geometry.coordinates, seg);
    if(best === null || d < best.distance) {
      return {
        distance: d,
        i: i,
        segment: seg
      }
    }
    else return best
  },null)

  if(nearest === null || nearest.i < 0) {
    console.log('something has gone horribly wrong');
    console.log(nearest);
    console.log(result.length, inputLine.length);
    return;
  }

  if(dist(nearest.segment[0], end(northern.geometry.coordinates)) > dist(end(nearest.segment), end(northern.geometry.coordinates))) {
    nearest.segment.reverse();
  }

  result.push(inputLine[nearest.i]);
  inputLine.splice(nearest.i, 1);
  return {distance: nearest.distance, feature: end(result)} 
}


