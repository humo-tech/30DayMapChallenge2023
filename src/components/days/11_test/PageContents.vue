<script setup>
import { ref, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import isBetween from 'dayjs/plugin/isBetween'
import maplibregl from 'maplibre-gl'
import { AWS_LOCATIONSERVICE_APIKEY } from '@/consts'
import 'maplibre-gl/dist/maplibre-gl.css'
import protocolBy2d from './sepiaColorProtocolBy2d'
import protocolBy3d from './sepiaColorProtocol'

dayjs.extend(utc)
dayjs.extend(isBetween)

const apiKey = AWS_LOCATIONSERVICE_APIKEY
const mapName = 'EsriImagery'
const region = 'ap-northeast-1'

let map
const mapElem = ref(null)

const testCount = ref(null)
const testRoute = [
  { center: [135, 35], zoom: 9 },
  { center: [139, 36], zoom: 7 },
  { center: [138, 37], zoom: 5 },
  { center: [130, 30], zoom: 6 },
  { center: [140, 43], zoom: 9 },
  { center: [135, 37], zoom: 4 },
]

const showPerformance = () => {
  const peformance = performance.getEntriesByName('performance')
  const durations = peformance.map((p) => p.duration)
  const totalDuration = durations.reduce((prev, curr) => prev + curr, 0)
  console.table({
    duration: totalDuration / durations.length,
    count: durations.length,
  })

  const max = Math.max(...durations)
  const min = Math.min(...durations)
  const classes = 10
  const step = (max - min) / classes
  const histogram = new Array(classes + 1).fill(0)
  durations.forEach((d) => {
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

  // console.table(durations)
}

watch(testCount, () => {
  // console.log(testRoute[testCount.value])
  map.flyTo({ center: testRoute[testCount.value].center, zoom: testRoute[testCount.value].zoom })
  if (testCount.value < testRoute.length - 1) {
    setTimeout(() => {
      testCount.value++
    }, 3000)
  } else {
    showPerformance()
  }
})

/**
 * 現在時刻の少し前のレーダーのタイルURLを取得する関数
 */
const fetchCurrentRadarTileUrl = () => {
  return fetchCurrentRadarTime().then(({ basetime, validtime }) => {
    return `https://www.jma.go.jp/bosai/jmatile/data/nowc/${basetime}/none/${validtime}/surf/hrpns/{z}/{x}/{y}.png`
  })
}

/**
 * 現在時刻の少し前の時刻のレーダー情報を取得する関数
 */
const fetchCurrentRadarTime = () => {
  return fetch('https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N1.json')
    .then((res) => res.json())
    .then((json) => {
      const now = dayjs()
      return json.find((data) => dayjs.utc(data.validtime).isBetween(now.subtract(10, 'minutes'), now))
    })
}

onMounted(async () => {
  const params = new URLSearchParams(location.search)
  const protocol = params.has('cpu') ? protocolBy2d : protocolBy3d
  maplibregl.addProtocol('sepia', protocol)

  const tileUrl = await fetchCurrentRadarTileUrl()
  map = new maplibregl.Map({
    container: mapElem.value,
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`,
    center: [135, 37],
    zoom: 4,
    customAttribution: [
      '<a href="https://www.jma.go.jp/bosai/nowc/" target="_blank">気象庁, Japan Meteorological Agency</a>',
    ],
    hash: true,
  })

  map.on('load', () => {
    // map.addSource('radar', { type: 'raster', tiles: [`converter://${tileUrl}`], maxzoom: 9 })
    map.addSource('radar', { type: 'raster', tiles: [`sepia://${tileUrl}`], maxzoom: 9 })
    // map.addSource('radar', { type: 'raster', tiles: [`${tileUrl}`], maxzoom: 9 })
    map.addLayer({
      id: 'radarRaw',
      source: 'radar',
      type: 'raster',
      paint: {
        'raster-resampling': 'nearest',
      },
    })

    setTimeout(() => {
      testCount.value = 0
    }, 1000)

    map.on('click', (e) => {
      console.log(e.lngLat)
    })
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
