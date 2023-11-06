<script setup>
import { ref, onMounted, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const baseUrl = import.meta.env.BASE_URL

let map
const mapElem = ref(null)
let yieldData = {}
const year = ref(1961)
let clearId = null
const minValue = 5000
const maxValue = 80000
const minColor = '#fcc'
const maxColor = '#f00'

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
        'fill-color': ['interpolate', ['linear'], ['feature-state', 'yield'], minValue, minColor, maxValue, maxColor],
      },
      filter: ['==', 'CONTINENT', 'Asia'],
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

const loadYieldData = () => {
  return fetch(`${baseUrl}/days/06/rice_yield.csv`)
    .then((res) => res.text())
    .then((text) => {
      const [header, ...body] = text.split(/[\r\n]/)
      const headers = header.split(/,/)
      return body.reduce((prev, curr) => {
        const [code, name, ...yields] = curr.split(/,/)
        prev[code] = { name }
        yields.forEach((value, index) => {
          prev[code][headers[index + 2]] = Number(value)
        })
        return prev
      }, {})
    })
}

const setData = (year) => {
  Object.entries(yieldData).forEach(([key, value]) => {
    map.setFeatureState({ source: 'country', id: key }, { yield: value[`Y${year}`] || 0 })
  })
}

const anim = () => {
  if (year.value < 2021) {
    year.value++
    clearId = setTimeout(anim, 500)
  } else {
    stop()
  }
}
const stop = () => {
  clearTimeout(clearId)
  clearId = null
}

const toggleAnim = () => {
  if (clearId) stop()
  else anim()
}

onMounted(async () => {
  yieldData = await loadYieldData()
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

  map.on('load', () => {
    setData(year.value)
  })
})

watch(year, () => {
  setData(year.value)
})
</script>

<template>
  <div ref="mapElem" class="map"></div>
  <div class="control">
    <div class="year">{{ year }}</div>
    <input type="range" min="1961" max="2021" v-model.number="year" />
    <button @click="toggleAnim()">▶</button>
  </div>
  <img :src="`${baseUrl}/days/06/flower_ine.png`" />
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
img {
  position: absolute;
  top: 100px;
  left: 40px;
  width: 200px;
}
</style>
