<script setup>
import { ref, onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const baseUrl = import.meta.env.BASE_URL

let map
const mapElem = ref(null)

const filter = ['all', ['==', 'CONTINENT', 'South America'], ['!=', 'ISO_A2', 'FK']]
const style = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    country: {
      type: 'geojson',
      data: `${baseUrl}/common/ne_110m_admin_0_countries.geojson`,
      attribution: '<a href="https://www.naturalearthdata.com/" target="_blank">Natural Earth</a>',
    },
  },
  layers: [
    {
      id: 'country_fill',
      source: 'country',
      type: 'fill',
      paint: {
        'fill-pattern': ['concat', 'flags/', ['get', 'ISO_A2']],
      },
      filter,
    },
    {
      id: 'country_line_edge',
      source: 'country',
      type: 'line',
      paint: { 'line-color': '#002', 'line-width': 10, 'line-blur': 0 },
      filter,
    },
    {
      id: 'country_line',
      source: 'country',
      type: 'line',
      paint: { 'line-color': '#fff', 'line-width': 2 },
      filter,
    },
  ],
}

const cacheLoadImage = (url) => {
  if (!cacheLoadImage.cache) cacheLoadImage.cache = {}
  if (!cacheLoadImage.cache[url]) {
    cacheLoadImage.cache[url] = loadImage(url)
  }
  return cacheLoadImage.cache[url]
}
const loadImage = (url) => {
  loadImage.cache = {}
  return new Promise((resolve) => {
    map.loadImage(url, (error, image) => {
      if (error) throw new Error(error)
      const reductionSize = 3
      const outputWidth = image.width / reductionSize
      const outputHeight = image.height / reductionSize
      const canvas = document.createElement('canvas')
      canvas.width = outputWidth
      canvas.height = outputHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, outputWidth, outputHeight)
      resolve(ctx.getImageData(0, 0, outputWidth, outputHeight))
    })
  })
}

const loadFlagImage = async (event) => {
  if (!/^flags\//.test(event.id)) return
  const imageUrl = `${baseUrl}/days/12/${event.id}.gif`
  const image = await cacheLoadImage(imageUrl)
  if (!map.getImage(event.id)) {
    map.addImage(event.id, image)
  }
}

onMounted(async () => {
  map = new maplibregl.Map({
    container: mapElem.value,
    style,
    center: [-60, -20],
    zoom: 2.6,
    bearing: -30,
    customAttribution: [
      '<a href="https://www.mofa.go.jp/mofaj/kids/kokki/k_latinamerica.html" target="_blank">国旗：外務省(Ministry of Foreign Affairs of Japan)</a>',
    ],
  })

  map.on('styleimagemissing', loadFlagImage)
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
