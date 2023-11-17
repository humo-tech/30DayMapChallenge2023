<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl-3.0.0-rc.2'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'
import 'mapbox-gl-3.0.0-rc.2/dist/mapbox-gl.css'

let map
const mapElem = ref(null)

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN
onMounted(() => {
  map = new mapboxgl.Map({
    container: mapElem.value,
    style: 'mapbox://styles/mapbox/standard',
    center: [151.2152407396187, -33.85646642880793],
    zoom: 17,
    pitch: 80,
  })
  map.on('style.load', () => {
    map.setConfigProperty('basemap', 'lightPreset', 'dusk')
    rotateCamera(0)
  })

  function rotateCamera(timestamp) {
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    map.rotateTo((timestamp / 100) % 360, { duration: 0 })
    // Request the next frame of the animation.
    requestAnimationFrame(rotateCamera)
  }
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
