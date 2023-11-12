<script setup>
import { ref, onMounted, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { AWS_LOCATIONSERVICE_APIKEY } from '@/consts'
import protocolBy2d from './gsjDemProtocolBy2d'
import protocolBy3d from './gsjDemProtocol'
import colorProtocol from './gsjDemColorProtocol'

let map
const mapElem = ref(null)

const testCount = ref(null)
const testRoute = [
  { center: [115.84, 39.9], zoom: 7 },
  { center: [150.82, -34.02], zoom: 6 },
  { center: [52.43, 34.26], zoom: 4 },
  { center: [9.92, 52.79], zoom: 7 },
  { center: [-78.01, 38.4], zoom: 8 },
  { center: [-70.07, -30.08], zoom: 6 },
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

const apiKey = AWS_LOCATIONSERVICE_APIKEY
const mapName = 'EsriImagery'
const region = 'ap-northeast-1'

onMounted(async () => {
  const params = new URLSearchParams(location.search)
  const protocol = params.has('cpu') ? protocolBy2d : protocolBy3d
  maplibregl.addProtocol('dem', protocol)
  maplibregl.addProtocol('color', colorProtocol)
  map = new maplibregl.Map({
    container: mapElem.value,
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`,
    center: [135, 37],
    zoom: 4,
    pitch: 50,
    hash: true,
  })

  map.on('load', () => {
    map.addSource('dem', {
      type: 'raster-dem',
      tiles: ['dem://https://tiles.gsj.jp/tiles/elev/mixed/{z}/{y}/{x}.png'],
      tileSize: 256,
      maxzoom: 17,
    })
    map.setTerrain({
      source: 'dem',
      exaggeration: 10,
    })
    // map.addControl(
    //  new maplibregl.TerrainControl({
    //    source: 'dem',
    //    exaggeration: 10,
    //  }), 'bottom-right'
    // )

    if (params.has('performance')) {
      setTimeout(() => {
        testCount.value = 0
      }, 3000)
    }
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
./gsjColorProtocolBy2d
