const axios = require('axios')
const helpers = require('@turf/helpers')
const bboxPolygon = require('@turf/bbox-polygon')
const distance = require('@turf/distance')

const Options = {
  language: 'en',
  sensor: false,
  short: false,
}

/**
 * Parses Address Component into a single layer Object
 */
function parseAddressComponents(components, short = Options.short) {
  const results = {}
  components.map(component => {
    if (short) { results[component.types[0]] = component.short_name
    } else { results[component.types[0]] = component.long_name }
  })
  return results
}

/**
 * Converts GoogleResult Bounds to BBox
 */
function parseBBox(result) {
  if (result.geometry) {
    if (result.geometry.viewport) {
      const viewport = result.geometry.viewport
      return [viewport.southwest.lng, viewport.southwest.lat, viewport.northeast.lng, viewport.northeast.lat]
    }
  }
}

/**
 * Converts GoogleResult to GeoJSON Point
 */
function parsePoint(result) {
  if (result.geometry) {
    if (result.geometry.location) {
      const {lng, lat} = result.geometry.location
      return helpers.point([lng, lat])
    }
  }
}

/**
 * Score (2 worst to 10 best) Distance (kilometers)
 */
const scoreMatrix = [
  [2, 25],
  [3, 20],
  [4, 15],
  [5, 10],
  [6, 7.5],
  [7, 5],
  [8, 1],
  [9, 0.5],
  [10, 0.25],
]

/**
 * Generates a confidence score from 1 (worst) to 10 (best) from a given BBox
 *
 * @param {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @returns {number} confidence score
 * @example
 * confidenceScore([-75.1, 45.1, -75, 45])
 * //=4
 * confidenceScore([-75.001, 45.001, -75, 45])
 * //=10
 */
function confidenceScore(bbox) {
  if (bbox === undefined) { return 0 }
  let result = 0
  const poly = bboxPolygon(bbox)
  const sw = helpers.point(poly.geometry.coordinates[0][0])
  const ne = helpers.point(poly.geometry.coordinates[0][2])
  const d = distance(sw, ne, 'kilometers')
  scoreMatrix.map(step => {
    const [score, maximum] = step
    if (d < maximum) { result = score }
    if (d >= 25) { result = 1 }
  })
  return result
}

function toGeoJSON(json, options = Options) {
  const short = options.short || Options.short
  const collection = helpers.featureCollection([])
  
  json.results.map(result => {
    // Get Geometries
    const point = parsePoint(result)
    const bbox = parseBBox(result)

    // Calculate Confidence score
    const location_type = result.geometry.location_type
    let confidence = confidenceScore(bbox)
    if (location_type === 'ROOFTOP') { confidence = 10 }

    // GeoJSON Point properties
    const properties = {
      confidence,
      location_type,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
      types: result.types,
    }

    // Google Specific Properties
    const components = parseAddressComponents(result.address_components, short)
    Object.keys(components).forEach(key => properties[key] = components[key])

    // Store Point to GeoJSON feature collection
    if (point) {
      point.bbox = bbox
      point.properties = properties
      collection.features.push(point)
    }
  })
  return collection
}

function google(address, options = Options) {
  // Define Options
  const language = options.language || Options.language
  const sensor = options.sensor || Options.sensor
  options.short = options.short || Options.short

  // URL Parameters
  const params = {
    address,
    language,
    sensor,
  }

  // Add the api key to if specified
  if (options.key) params.key = options.key

  // Request
  const url = 'https://maps.googleapis.com/maps/api/geocode/json'

  // Create custom Axios instance
  const instance = axios.create({})

  // Remove any existing default Authorization headers
  if (instance.defaults.headers.common && instance.defaults.headers.common.Authorization) { delete instance.defaults.headers.common.Authorization }
  if (instance.defaults.headers.Authorization) { delete instance.defaults.headers.Authorization }

  return new Promise((resolve, reject) => {
    instance.get(url, { params }).then(response => {
      const geojson = toGeoJSON(response.data, options)
      return resolve(geojson)
    })
  })
}

module.exports = google
