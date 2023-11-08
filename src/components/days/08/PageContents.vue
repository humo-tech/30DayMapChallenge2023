<script setup>
import { ref, onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const baseUrl = import.meta.env.BASE_URL

let map
const mapElem = ref(null)
const minValue = 1000000
const maxValue = 200000000
const minColor = '#fcc'
const maxColor = '#f00'

const filter = ['==', 'CONTINENT', 'Africa']
const style = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    country: {
      type: 'geojson',
      data: `${baseUrl}/common/ne_110m_admin_0_countries.geojson`,
      promoteId: 'ISO_A2_EH',
    },
  },
  layers: [
    {
      id: 'country_fill',
      source: 'country',
      type: 'fill',
      paint: {
        'fill-color': ['interpolate', ['linear'], ['get', 'POP_EST'], minValue, minColor, maxValue, maxColor],
      },
      filter,
    },
    {
      id: 'country_line_edge',
      source: 'country',
      type: 'line',
      paint: { 'line-color': '#002', 'line-width': 5, 'line-blur': 4 },
      filter,
    },
    {
      id: 'country_line',
      source: 'country',
      type: 'line',
      paint: { 'line-color': '#fff', 'line-width': 1 },
      filter,
    },
    {
      id: 'pop_label',
      source: 'country',
      type: 'symbol',
      layout: {
        'text-padding': 0,
        'text-field': [
          'format',
          ['number-format', ['/', ['get', 'POP_EST'], 1000000], { 'min-fraction-digits': 1, 'max-fraction-digits': 1 }],
          { 'font-scale': 1 },
          '\n',
          { 'font-scale': 0.7 },
          ['concat', ['concat', '(', ['get', 'ADMIN']], ')'],
          { 'font-scale': 0.5 },
        ],
        'text-size': 24,
        'text-max-width': 5,
      },
      paint: {
        'text-halo-color': '#fff',
        'text-halo-width': 2.5,
      },
      filter,
    },
  ],
}

onMounted(async () => {
  map = new maplibregl.Map({
    container: mapElem.value,
    style,
    center: [15, -5],
    zoom: 3.3,
    pitch: 40,
    customAttribution: ['<a href="https://www.naturalearthdata.com/" target="_blank">Natural Earth</a>'],
  })

  map.on('load', () => {})
})
</script>

<template>
  <div ref="mapElem" class="map"></div>
  <div class="scale">
    <div class="scale-title">Population</div>
    <div class="scale-body">
      <span>{{ (minValue / 1000000).toLocaleString() }}</span>
      <div class="scale-bar"></div>
      <span>{{ (maxValue / 1000000).toLocaleString() }}<small>M</small></span>
    </div>
  </div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 100%;
}
.control {
  position: absolute;
  bottom: 40px;
  left: 40px;
}
.year {
  font-size: 64px;
  color: #ccc;
  font-style: italic;
}
input[type='range'] {
  width: 200px;
}
.scale {
  position: absolute;
  bottom: 30px;
  right: 40px;
  color: #fff;
  font-size: 20px;
  background-color: #3339;
  padding: 10px 20px;
}
.scale-title {
  font-size: 24px;
  margin-bottom: 7px;
}
.scale-body {
  display: flex;
}
.scale-bar {
  width: 200px;
  height: 1em;
  background: linear-gradient(to right, v-bind(minColor), v-bind(maxColor));
  border: 1px solid #fff;
  margin: 0 5px;
}
</style>
