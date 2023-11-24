<script setup>
import { ref, onMounted, watch } from 'vue'
import * as maptilersdk from '@maptiler/sdk'
import { MAPTILER_API_KEY } from '@/consts'
import '@maptiler/sdk/dist/maptiler-sdk.css'

let map
const mapElem = ref(null)
const selected = ref('both')

watch(selected, (value) => {
  if (!map) return
  const layers = ['point0', 'point1', 'point2']
  let filter = null
  if (value === 'white' || value === 'black') {
    filter = ['==', ['get', 'color'], value]
  }
  layers.forEach((layerName) => {
    map.setFilter(layerName, filter)
  })
})

maptilersdk.config.apiKey = MAPTILER_API_KEY
onMounted(async () => {
  map = new maptilersdk.Map({
    container: mapElem.value,
    style: `https://api.maptiler.com/maps/c7b71667-7301-4c46-b32e-aa6d2adbd6ab/style.json?key=${MAPTILER_API_KEY}`,
    // style: {
    //  version: 8,
    //  sources: {},
    //  layers: [{ id: 'base', type: 'background', paint: { 'background-color': '#000' } }],
    // },
    center: [135, 36.5],
    zoom: 4.5,
    navigationControl: 'bottom-right',
    geolocateControl: 'bottom-right',
  })
  map.on('style.load', () => {
    map.addSource('point', {
      type: 'vector',
      url: 'https://humo-tech.github.io/vectortiles_30daymapchallenge2023_day23/tiles/tiles.json',
    })

    map.addLayer({
      id: 'point2',
      source: 'point',
      'source-layer': 'g-simplestyle-v1',
      type: 'circle',
      paint: {
        // 'circle-color': ['match', ['get', 'color'], 'white', '#fff', 'black', '#000', '#f00'],
        'circle-color': '#fff',
        'circle-blur': 5,
        'circle-radius': 5,
      },
    })
    map.addLayer({
      id: 'point1',
      source: 'point',
      'source-layer': 'g-simplestyle-v1',
      type: 'circle',
      paint: {
        // 'circle-color': ['match', ['get', 'color'], 'white', '#fff', 'black', '#000', '#f00'],
        'circle-color': '#fff',
        'circle-blur': 10,
        'circle-radius': 5,
      },
    })
    map.addLayer({
      id: 'point0',
      source: 'point',
      'source-layer': 'g-simplestyle-v1',
      type: 'circle',
      paint: {
        // 'circle-color': ['match', ['get', 'color'], 'white', '#fff', 'black', '#000', '#f00'],
        'circle-color': '#fff',
        'circle-radius': 1,
      },
    })
  })
})
</script>

<template>
  <div ref="mapElem" class="map"></div>
  <div class="control">
    <ul>
      <li>
        <label><input type="radio" name="menu" v-model="selected" value="both" />BOTH</label>
      </li>
      <li>
        <label><input type="radio" name="menu" v-model="selected" value="black" />Black</label>
      </li>
      <li>
        <label><input type="radio" name="menu" v-model="selected" value="white" />White</label>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 100%;
}
.control {
  position: absolute;
  left: 30px;
  top: 100px;
  z-index: 10;
}
.control ul {
  list-style-type: none;
  padding: 10px 15px;
  background-color: #0009;
}
.control li {
  color: #fff;
  font-size: 20px;
  line-height: 1.5em;
}
</style>
