<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl-3.0.0-rc.2'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'
import 'mapbox-gl-3.0.0-rc.2/dist/mapbox-gl.css'
import { SphereLayer } from './SphereLayer'
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

let map
const mapElem = ref(null)

onMounted(async () => {
  map = new mapboxgl.Map({
    container: mapElem.value,
    style: 'mapbox://styles/mapbox/standard',
    center: [-115.160592, 36.12005],
    zoom: 16.12,
    pitch: 66,
    bearing: -99.8,
    hash: true,
    projection: 'mercator',
  })

  map.on('style.load', async () => {
    map.setConfigProperty('basemap', 'lightPreset', 'dusk')
    map.addLayer(
      new SphereLayer('circle', {
        center: [-115.160592, 36.12005],
        radius: 28,
        dencity: 30,
      })
    )
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
