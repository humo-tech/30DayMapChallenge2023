<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl-3.0.0-rc.2'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'
import 'mapbox-gl-3.0.0-rc.2/dist/mapbox-gl.css'
import { Pane } from 'tweakpane'

let map
let pane
const mapElem = ref(null)
const containerElem = ref(null)
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

const PARAMS = {
  opacity: 1,
}

onMounted(() => {
  pane = new Pane({ container: containerElem.value })
  pane.addBinding(PARAMS, 'opacity', { min: 0, max: 1, step: 0.01 }).on('change', (ev) => {
    map.setPaintProperty('fuji', 'raster-opacity', ev.value)
  })
  map = new mapboxgl.Map({
    container: mapElem.value,
    // style: 'mapbox://styles/mapbox/dark-v11',
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [138.7303, 35.27378],
    zoom: 11.85,
    pitch: 85,
    hash: true,
  })
  map.on('load', async () => {})
  map.on('style.load', () => {
    map.setFog({
      color: 'rgb(186, 210, 235)', // Lower atmosphere
      // 'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
      // 'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
      // 'space-color': 'rgb(11, 11, 25)', // Background color
      // 'star-intensity': 0.6, // Background star brightness (default 0.35 at low zoooms )
    })
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14,
    })
    // add the DEM source as a terrain layer with exaggerated height
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.0 })

    map.addSource('fuji', {
      type: 'raster',
      tiles: ['https://humo.tech/30daymapchallenge/fuji/tiles/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '<a href="https://apps.sentinel-hub.com/eo-browser/">Sentinel2</a>',
      maxzoom: 14,
    })
    map.addLayer({
      id: 'fuji',
      source: 'fuji',
      type: 'raster',
      paint: {
        'raster-contrast': 0.5,
        'raster-saturation': -0.2,
        'raster-opacity': PARAMS.opacity,
      },
    })
  })
})
</script>

<template>
  <div ref="mapElem" class="map"></div>
  <div ref="containerElem" class="container"></div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 100%;
}
.container {
  position: absolute;
  bottom: 50px;
  left: 30px;
}
</style>
