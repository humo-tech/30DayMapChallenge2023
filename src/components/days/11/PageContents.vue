<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import isBetween from 'dayjs/plugin/isBetween'
import maplibregl from 'maplibre-gl'
import { AWS_LOCATIONSERVICE_APIKEY } from '@/consts'
import 'maplibre-gl/dist/maplibre-gl.css'
import { protocol } from './sepiaColorProtocol'
maplibregl.addProtocol('sepia', protocol)

dayjs.extend(utc)
dayjs.extend(isBetween)

const apiKey = AWS_LOCATIONSERVICE_APIKEY
const mapName = 'EsriImagery'
const region = 'ap-northeast-1'

let map
const mapElem = ref(null)

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
./sepiaColorProtocol
