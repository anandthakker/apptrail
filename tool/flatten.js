// Flatten a Multi* feature into an array of * features
// Flatten a FeatureCollection's features
module.exports = function flatten (geojson) {
  if(/FeatureCollection/.test(geojson.type)) {
    features = Array.prototype.concat.apply([], geojson.features.map(flatten))
    return {
      type: 'FeatureCollection',
      properties: geojson.properties,
      features: features
    }
  }
  else if(/^Multi/.test(geojson.geometry.type)) {
    return geojson.geometry.coordinates.map(function single (coords) {
      return {
        type: 'Feature',
        properties: geojson.properties,
        geometry: {
          type: geojson.geometry.type.substring(5),
          coordinates: coords
        }
      }
    })
  } else {
    return [geojson]
  }
}
