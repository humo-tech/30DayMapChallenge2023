<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl-3.0.0-rc.2'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'
import 'mapbox-gl-3.0.0-rc.2/dist/mapbox-gl.css'
import { NoiseCloudLayer } from './NoiseCloudLayer'

let map
const mapElem = ref(null)
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

onMounted(() => {
  map = new mapboxgl.Map({
    container: mapElem.value,
    style: 'mapbox://styles/mapbox/standard',
    // style: 'mapbox://styles/mapbox/dark-v11',
    center: [139.65, 36.65],
    zoom: 9,
    pitch: 60,
    hash: true,
    language: 'ja',
    projection: 'mercator',
  })
  const bbox = [
    { lng: 139.3, lat: 36.2 },
    { lng: 140.3, lat: 36.2 },
    { lng: 140.3, lat: 35.2 },
    { lng: 139.3, lat: 35.2 },
  ]
  map.on('load', () => {
    map.addLayer(new NoiseCloudLayer('cloud100m', bbox, { alt: 734, opacity: 0.3, contrast: 0.6 }))
    // map.addLayer(new NoiseCloudLayer('cloud0m', bbox, { alt: 0, noUpdate: true }))
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
./NoiseCloudLayer
