<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl-3.0.0-rc.2'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'
import 'mapbox-gl-3.0.0-rc.2/dist/mapbox-gl.css'
import { NoiseCloudLayer } from './NoiseCloudLayer'

let map
const animFlag = ref(true)
const cloudOpacity = ref(0.3)
const mapElem = ref(null)
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

function rotateCamera(timestamp) {
  // clamp the rotation between 0 -360 degrees
  // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
  if (animFlag.value) map.rotateTo((timestamp / 100) % 360, { duration: 0 })
  // Request the next frame of the animation.
  requestAnimationFrame(rotateCamera)
}

onMounted(() => {
  const bbox = [
    { lng: 139.3, lat: 36.2 },
    { lng: 140.3, lat: 36.2 },
    { lng: 140.3, lat: 35.2 },
    { lng: 139.3, lat: 35.2 },
  ]
  const cloudLayer = new NoiseCloudLayer('cloud0', bbox, { alt: 734, opacity: cloudOpacity.value, contrast: 0.6 })
  map = new mapboxgl.Map({
    container: mapElem.value,
    style: 'mapbox://styles/mapbox/standard',
    // style: 'mapbox://styles/mapbox/dark-v11',
    center: [139.8104, 35.7102],
    zoom: 15,
    pitch: 70,
    // hash: true,
    projection: 'mercator',
  })
  map.on('style.load', () => {
    map.setConfigProperty('basemap', 'lightPreset', 'night')
    map.addLayer(cloudLayer)
    // rotateCamera(0)
  })
  map.on('click', () => {
    // animFlag.value = !animFlag.value
    cloudOpacity.value = cloudOpacity.value === 0 ? 0.3 : 0
    cloudLayer.updateOpacity(cloudOpacity.value)
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
