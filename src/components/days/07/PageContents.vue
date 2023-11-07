<script setup>
import { ref, onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import { AWS_LOCATIONSERVICE_APIKEY, MAPBOX_ACCESS_TOKEN } from '@/consts'
import 'maplibre-gl/dist/maplibre-gl.css'
import { LocationClient, CalculateRouteCommand } from '@aws-sdk/client-location'
import { withAPIKey } from '@aws/amazon-location-utilities-auth-helper'
const apiKey = AWS_LOCATIONSERVICE_APIKEY
// const mapName = 'EsriImagery'
// const mapName = '30daymapchallenge'
const mapName = 'OpenDataStandardLight'
const region = 'ap-northeast-1'

const authHelper = await withAPIKey(apiKey)
const client = new LocationClient({
  region, // region containing Cognito pool
  ...authHelper.getLocationClientConfig(), // Provides configuration required to make requests to Amazon Location
})

const status = ref('waiting')

const color = {
  mapbox: '#4264fb',
  here: '#00dd00',
  esri: '#dd0000',
}

let map
const mapElem = ref(null)

let fromMarker = null
let toMarker = null

const byAmazon = async (from, to, provider = 'esri') => {
  const input = {
    CalculatorName: provider === 'esri' ? '30daymapchallenge' : '30daymapchallengeHERE',
    DeparturePosition: from,
    DestinationPosition: to,
  }

  const command = new CalculateRouteCommand(input)

  const result = await client.send(command)

  const leg = result.Legs[0]
  let coordinates = []
  if (leg) {
    coordinates = leg.Steps.map((step) => step.StartPosition)
    coordinates.push(leg.Steps[leg.Steps.length - 1].EndPosition)
  }

  return {
    type: 'Feature',
    geometry: {
      coordinates,
      type: 'LineString',
    },
  }
}

const byMapbox = async (from, to) => {
  const lnglat = encodeURIComponent(`${from[0]},${from[1]};${to[0]},${to[1]}`)
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${lnglat}`)
  url.searchParams.set('geometries', 'geojson')
  url.searchParams.set('access_token', MAPBOX_ACCESS_TOKEN)

  const result = await fetch(url).then((res) => res.json())
  const reg = result.routes[0]
  return {
    type: 'Feature',
    geometry: reg.geometry,
  }
}

const search = async () => {
  if (fromMarker && toMarker) {
    const from = fromMarker.getLngLat()
    const to = toMarker.getLngLat()
    const [esri, here, mapbox] = await Promise.all([
      byAmazon([from.lng, from.lat], [to.lng, to.lat], 'esri'),
      byAmazon([from.lng, from.lat], [to.lng, to.lat], 'here'),
      byMapbox([from.lng, from.lat], [to.lng, to.lat]),
    ])

    console.log(esri, here, mapbox)
    map.getSource('esri').setData(esri)
    map.getSource('here').setData(here)
    map.getSource('mapbox').setData(mapbox)
  }
}

const addMarker = (e) => {
  status.value = 'start'
  if (!fromMarker) {
    fromMarker = new maplibregl.Marker({ color: '#c00', draggable: true }).setLngLat(e.lngLat).addTo(map)
    fromMarker.on('dragend', (e) => {
      search()
    })
  } else if (!toMarker) {
    toMarker = new maplibregl.Marker({ color: '#000', draggable: true }).setLngLat(e.lngLat).addTo(map)
    toMarker.on('dragend', (e) => {
      search()
    })
    map.off('click', addMarker)
    search()
  }
}

onMounted(async () => {
  map = new maplibregl.Map({
    container: mapElem.value,
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`,
    center: [139.76, 35.73],
    zoom: 10,
    maxZoom: 15,
    hash: true,
    projection: 'mercator',
  })

  map.on('load', () => {
    map.addSource('esri', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map.addLayer({
      id: 'esriEdge',
      source: 'esri',
      type: 'line',
      paint: {
        'line-color': '#000000',
        'line-width': 10,
      },
    })
    map.addLayer({
      id: 'esri',
      source: 'esri',
      type: 'line',
      paint: {
        'line-color': color.esri,
        'line-width': 5,
      },
    })
    map.addSource('here', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map.addLayer({
      id: 'hereEdge',
      source: 'here',
      type: 'line',
      paint: {
        'line-color': '#000000',
        'line-width': 10,
      },
    })
    map.addLayer({
      id: 'here',
      source: 'here',
      type: 'line',
      paint: {
        'line-color': color.here,
        'line-width': 5,
      },
    })
    map.addSource('mapbox', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map.addLayer({
      id: 'mapboxEdge',
      source: 'mapbox',
      type: 'line',
      paint: {
        'line-color': '#000000',
        'line-width': 10,
      },
    })
    map.addLayer({
      id: 'mapbox',
      source: 'mapbox',
      type: 'line',
      paint: {
        'line-color': color.mapbox,
        'line-width': 5,
      },
    })

    map.on('click', addMarker)
  })
})
</script>

<template>
  <div ref="mapElem" class="map"></div>
  <div class="dialog" v-if="status === 'waiting'">Click the map to add waypoints</div>
  <ul>
    <li class="esri">ESRI (Amazon Location Service)</li>
    <li class="here">HERE (Amazon Location Service)</li>
    <li class="mapbox">MapBox Directions API</li>
  </ul>
</template>

<style scoped>
.dialog {
  background-color: #0009;
  color: #fff;
  font-size: 20px;
  padding: 30px 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 5px;
}
.map {
  width: 100%;
  height: 100%;
}
ul {
  position: absolute;
  padding: 20px;
  margin: 0;
  top: 100px;
  left: 50px;
  list-style-type: none;
  background-color: #001c;
  color: #fff;
  border-radius: 5px;
}
li {
  line-height: 1.5em;
}
li:before {
  content: '';
  display: inline-block;
  width: 2em;
  height: 0.2em;
  border: 2px solid #999;
  background-color: #fff;
  margin-right: 6px;
  position: relative;
  top: -2px;
  vertical-align: middle;
}
li.esri:before {
  background-color: v-bind(color.esri);
}
li.here:before {
  background-color: v-bind(color.here);
}
li.mapbox:before {
  background-color: v-bind(color.mapbox);
}
</style>
