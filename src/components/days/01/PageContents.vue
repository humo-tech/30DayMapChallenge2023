<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'
import 'mapbox-gl/dist/mapbox-gl.css'

const baseUrl = import.meta.env.BASE_URL

let map
const mapElem = ref(null)

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN
onMounted(() => {
  map = new mapboxgl.Map({
    container: mapElem.value,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [135, 36],
    zoom: 4.5,
    maxZoom: 15,
    customAttribution: ['<a href="https://overturemaps.org/">Overture Maps</a>'],
    hash: true,
    projection: 'mercator',
  })
  map.on('load', () => {
    map.addSource('points', { type: 'geojson', data: `${baseUrl}/days/01/coffee_shop.geojson` })
    map.addLayer({
      id: 'points0',
      source: 'points',
      type: 'circle',
      paint: {
        'circle-color': '#d6d854',
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 10, 15, 5],
        'circle-blur': 3,
        'circle-opacity': 0.4,
      },
    })
    map.addLayer({
      id: 'points1',
      source: 'points',
      type: 'circle',
      paint: {
        'circle-color': '#ffff00',
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 5, 15, 2],
        'circle-blur': 3,
        'circle-opacity': 0.4,
      },
    })
    map.addLayer({
      id: 'points2',
      source: 'points',
      type: 'circle',
      paint: {
        'circle-color': ['interpolate', ['linear'], ['zoom'], 10, '#ffffff', 15, '#ffc'],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 1, 15, 3],
        'circle-blur': 0,
        'circle-opacity': 1,
      },
    })
  })
})
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
