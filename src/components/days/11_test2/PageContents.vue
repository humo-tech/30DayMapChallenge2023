<script setup>
import { ref, onMounted, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import protocolBy2d from './gsjDemProtocolBy2d'
import protocolBy3d from './gsjDemProtocol'
import colorProtocol from './gsjDemColorProtocol'

const baseUrl = import.meta.env.BASE_URL

let map
const mapElem = ref(null)

const testCount = ref(null)
const testRoute = [
  { center: [115.84, 39.9], zoom: 6 },
  { center: [150.82, -34.02], zoom: 5 },
  { center: [52.43, 34.26], zoom: 3 },
  { center: [9.92, 52.79], zoom: 6 },
  { center: [-78.01, 38.4], zoom: 7 },
  { center: [-70.07, -30.08], zoom: 5 },
  { center: [135, 37], zoom: 4 },
]

const showStatistics = (data, title) => {
  console.log(title)
  const total = data.reduce((prev, curr) => prev + curr, 0)
  console.table({
    average: total / data.length,
    count: data.length,
  })

  const max = Math.max(...data)
  const min = Math.min(...data)
  const classes = 10
  const step = (max - min) / classes
  const histogram = new Array(classes + 1).fill(0)
  data.forEach((d) => {
    const rank = Math.min(Math.floor((d - min) / step), classes)
    histogram[rank]++
  })
  console.table(
    histogram.map((data, index) => {
      return {
        rank: (min + index * step).toFixed(2),
        count: data,
      }
    })
  )
}
const showPerformance = () => {
  const peformance = performance.getEntriesByName('performance')
  const durations = peformance.map((p) => p.duration)
  showStatistics(durations, 'alldata')

  const num = durations.length
  const durations95 = durations.sort().slice(Math.round(num * 0.025), Math.round(num * (1 - 0.025)))
  showStatistics(durations95, '95percentile')

  // console.table(durations)
}

watch(testCount, () => {
  // console.log(testRoute[testCount.value])
  map.flyTo({ center: testRoute[testCount.value].center, zoom: testRoute[testCount.value].zoom })
  if (testCount.value < testRoute.length - 1) {
    setTimeout(() => {
      testCount.value++
    }, 5000)
  } else {
    setTimeout(() => {
      showPerformance()
    }, 1000)
  }
})

const style = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    country: {
      type: 'geojson',
      data: `${baseUrl}/common/ne_110m_admin_0_countries.geojson`,
      attribution: '<a href="https://www.naturalearthdata.com/" target="_blank">Natural Earth</a>',
    },
    dem: {
      type: 'raster-dem',
      tiles: ['dem://https://tiles.gsj.jp/tiles/elev/mixed/{z}/{y}/{x}.png'],
      tileSize: 256,
      maxzoom: 17,
    },
    elevation: {
      type: 'raster',
      tiles: ['color://https://tiles.gsj.jp/tiles/elev/mixed/{z}/{y}/{x}.png'],
      tileSize: 256,
      maxzoom: 17,
    },
  },
  layers: [
    {
      id: 'country_fill',
      source: 'country',
      type: 'fill',
      paint: {
        'fill-color': '#ccc',
      },
    },
    {
      id: 'country_line',
      source: 'country',
      type: 'line',
      paint: { 'line-color': '#000', 'line-width': 1 },
    },
    // {
    //  id: 'hillshade',
    //  source: 'dem',
    //  type: 'hillshade',
    // },
    {
      id: 'demcolor',
      source: 'elevation',
      type: 'raster',
      paint: {
        // 'raster-opacity': 0.8,
      },
    },
  ],
  terrain: {
    source: 'dem',
    exaggeration: 10,
  },
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
      const reductionSize = 1
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
  const params = new URLSearchParams(location.search)
  const protocol = params.has('cpu') ? protocolBy2d : protocolBy3d
  maplibregl.addProtocol('dem', protocol)
  maplibregl.addProtocol('color', colorProtocol)
  map = new maplibregl.Map({
    container: mapElem.value,
    style,
    center: [135, 37],
    zoom: 4,
    pitch: 40,
    hash: true,
  })

  if (params.has('performance')) {
    setTimeout(() => {
      testCount.value = 0
    }, 3000)
  }

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
./gsjColorProtocolBy2d
