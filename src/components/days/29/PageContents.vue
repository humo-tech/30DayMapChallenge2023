<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl-3.0.0-rc.2'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'
import 'mapbox-gl-3.0.0-rc.2/dist/mapbox-gl.css'
import { ModelLayer } from './ModelLayer.js'
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

const baseUrl = import.meta.env.BASE_URL

let map
const mapElem = ref(null)

// parameters to ensure the model is georeferenced correctly on the map
const modelOrigin = [139.5, 36]
const modelAltitude = 100
const modelRotate = [Math.PI / 2, 0, 0]
const modelTransformInfo = {
  modelOrigin,
  modelAltitude,
  modelRotate,
}

const modelLayer = new ModelLayer('airplane', `${baseUrl}/days/29/drone.glb`, modelTransformInfo)

onMounted(async () => {
  map = new mapboxgl.Map({
    container: mapElem.value,
    style: 'mapbox://styles/mapbox/standard',
    center: [139.766736, 35.681339],
    zoom: 15,
    pitch: 71,
    bearing: -75,
    hash: true,
    projection: 'mercator',
  })

  map.on('style.load', async () => {
    map.addLayer(modelLayer)
    map.addSource('did', {
      type: 'vector',
      tiles: ['https://humo.tech/30daymapchallenge/2020_did_ddsw/{z}/{x}/{y}.pbf'],
      bounds: [124.137196, 24.331134, 145.608826, 45.443488],
      maxzoom: 12,
      attribution: '<a href="https://www.e-stat.go.jp" target="_blank">e-Stat 政府統計の総合窓口</a>',
    })
    map.addLayer({
      id: 'did',
      source: 'did',
      'source-layer': '2020_did_ddsw',
      type: 'fill',
      paint: {
        'fill-color': '#f00',
        'fill-opacity': 0.6,
      },
    })
    setDrone()
  })

  map.on('move', setDrone)
})

const setDrone = () => {
  const center = map.getCenter()
  const centerArray = [center.lng, center.lat]
  // map.setPitch(0)
  // console.log(map.queryRenderedFeatures([center.lng, center.lat], { layers: ['did'] }))
  // map.setPitch(pitch)
  modelTransformInfo.modelOrigin = centerArray
  modelLayer.updateTransform(modelTransformInfo)
  map.setPaintProperty('did', 'fill-color', [
    'step',
    ['zoom'],
    '#f00',
    13,
    [
      'case',
      [
        '<',
        [
          'distance',
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: centerArray,
            },
          },
        ],
        100,
      ],
      '#ff0',
      '#f00',
    ],
  ])
}
</script>

<template>
  <div ref="mapElem" class="map"></div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
