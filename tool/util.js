module.exports = {
  northernmost: northernmost,
  distance: dist,
  segmentDistance: segdist,
  end: end
}

function northernmost(features) {
  return features.reduce(function northmost (best, feat, i) {
    var seg = feat.geometry.coordinates
    var lat = Math.max(seg[0][1],seg[seg.length-1][1]);
    if(best === null || lat > best.lat) return { lat: lat, i: i }
    else return best;
  }, null)
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
