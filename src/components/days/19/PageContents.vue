<script setup>
import { ref, onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const baseUrl = import.meta.env.BASE_URL

let map
const mapElem = ref(null)
const minValue = 1000000
const maxValue = 200000000
const minColor = '#010'
const maxColor = '#0f7'

const style = {
  version: 8,
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
    },
    {
      id: 'country_line_edge',
      source: 'country',
      type: 'line',
      paint: { 'line-color': '#002', 'line-width': 5, 'line-blur': 4 },
      filter: ['==', 'CONTINENT', 'Asia'],
    },
    {
      id: 'country_line',
      source: 'country',
      type: 'line',
      paint: { 'line-color': '#fff', 'line-width': 1 },
      filter: ['==', 'CONTINENT', 'Asia'],
    },
  ],
}

onMounted(async () => {
  map = new maplibregl.Map({
    container: mapElem.value,
    style,
    center: [85, 30],
    zoom: 2.7,
    maxZoom: 2.7,
    customAttribution: [
      '<a href="https://www.naturalearthdata.com/">Natural Earth</a>',
      '<a href="https://www.fao.org/faostat/">FAOSTAT</a>',
    ],
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
