var fs = require('fs');
var end = require('./util').end;
var dist = require('./util').distance;
var segdist = require('./util').segmentDistance;
var northernmost = require('./util').northernmost;

var MAX_DELTA = 2; // units are weird/wrong lat/long pythagorean bs. 

// take a segment from inputLine, and splice it into result wherever it minimizes the 
// delta (distance) between it and its would-be neighbors in the result.
module.exports = function insertOne (inputLine, result) {
  inputLine = inputLine.features;
  result = result.features;
  
  if(result.length === 0) {
    var northern = northernmost(inputLine);
    result.push(inputLine.splice(northern.i, 1)[0]); 
    return {distance: 0, feature: end(result)};
  }

  if(result.length === 1) {
    result.splice(1, 0, feat);
    return {distance: segdist(result[0],result[1]), feature: end(result)};
  }

  var feat = inputLine.shift()
  var ins = { delta: Number.MAX_VALUE, i: -1 }
  var seg = feat.geometry.coordinates

  for (var i = 0; i <= result.length; i++) {
    var delta1 =  (i > 0) ? segdist(result[i-1].geometry.coordinates, seg) : 0;
    var delta2 =  (i < result.length) ? segdist(seg, result[i].geometry.coordinates) : 0;
    if(ins.i > 0 && delta1 + delta2 > MAX_DELTA) continue;
    // average of the two deltas (accounting for edge cases)
    var delta = (i > 0 && i < result.length) ? (delta1 + delta2)/2 : (delta1 + delta2); 
    if(delta < ins.delta) {
      var ahead = (i < result.length) ? result[i].geometry.coordinates : null;
      ins = {
        delta: delta,
        i: i,
        reverse: ahead && dist(ahead[0],seg[0]) < dist(ahead[0],seg[seg.length - 1]) 
      } 
    }
  };
  
  if(ins.i < 0) {
    console.error(result.length);
    console.error(feat);
    console.error('something is horribly wrong');
    return;
  }

  if(ins.reverse) { seg.reverse(); }
  result.splice(ins.i, 0, feat);
  return { distance: ins.delta, feature: result[ins.i] };
}


function dist(p1, p2) { return (p1[0]-p2[0])*(p1[0]-p2[0]) + (p1[1]-p2[1])*(p1[1]-p2[1]);}

function segdist(seg1, seg2) {
  var a = seg1[0]
  var b = seg1[seg1.length - 1]
  var c = seg2[0]
  var d = seg2[seg2.length - 1]
  var distance = Math.min(
    Math.min(dist(a,c),dist(b,d)),
    Math.min(dist(a,d),dist(b,c))
  )
  return distance;
}

function end(arr) { return arr[arr.length - 1]; }
