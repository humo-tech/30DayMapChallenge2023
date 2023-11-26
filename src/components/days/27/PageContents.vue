<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'
import 'mapbox-gl/dist/mapbox-gl.css'
import dayjs from 'dayjs'
import * as turf from '@turf/turf'

let map
const mapElem = ref(null)
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

const datetime = ref('')

/**
 * 最新のアメダス時刻を取得する関数
 */
const fetchCurrentAmedasTime = () => {
  return fetch('https://www.jma.go.jp/bosai/amedas/data/latest_time.txt')
    .then((res) => res.text())
    .then((text) => {
      return dayjs(text)
    })
}

/**
 * アメダス地点テーブルを取得する関数
 */
const fetchAmedasTable = () => {
  return fetch('https://www.jma.go.jp/bosai/amedas/const/amedastable.json').then((res) => res.json())
}

const convertCoordinates = (jmaCoord) => {
  return jmaCoord[0] + jmaCoord[1] / 60
}

/**
 * 地点テーブルとデータをマージする関数
 * @params {object} data
 * @params {object} table
 */
const makeAmedasGeoJSON = (data, table) => {
  const points = []
  Object.entries(table).forEach(([key, value]) => {
    const coordinates = [convertCoordinates(value.lon), convertCoordinates(value.lat)]
    points.push(turf.point(coordinates, { ...value, ...data[key] }))
  })

  return turf.featureCollection(points)
}

/**
 * アメダスデータのGeoJSONを取得する関数
 */
const fetchAmedasData = async (targetDateTime) => {
  const latestDataUrl = `https://www.jma.go.jp/bosai/amedas/data/map/${targetDateTime.format('YYYYMMDDHHmmss')}.json`
  const [amedasData, amedasTable] = await Promise.all([
    fetch(latestDataUrl).then((res) => res.json()),
    fetchAmedasTable(),
  ])

  const geojson = makeAmedasGeoJSON(amedasData, amedasTable)

  return geojson
}

const initMainMap = (amedasData) => {
  return new Promise((resolve) => {
    const map = new mapboxgl.Map({
      container: mapElem.value,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [136, 36.3],
      zoom: 4.5,
      projection: 'mercator',
    })
    map.on('style.load', async () => {
      map.setFog({
        'space-color': '#035',
        'star-intensity': 0.3,
      })

      map.addSource('points', {
        type: 'geojson',
        data: amedasData,
        attribution:
          '<a href="https://www.jma.go.jp/bosai/map.html#5/34.488/137.021/&elem=wind&contents=amedas&interval=60" target="_blank">JMA</a>',
      })

      map.addLayer({
        id: 'points',
        source: 'points',
        type: 'circle',
        paint: {
          'circle-color': '#ff0',
          'circle-stroke-color': '#000',
          'circle-stroke-width': 1,
          'circle-radius': [
            'let',
            'wind',
            ['sqrt', ['at', 0, ['get', 'wind']]],
            [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              5,
              ['*', 3, ['var', 'wind']],
              10,
              ['*', 7, ['var', 'wind']],
            ],
          ],
        },
        filter: ['!=', ['at', 0, ['get', 'wind']], null],
      })
      map.addLayer({
        id: 'text',
        source: 'points',
        type: 'symbol',
        layout: {
          'text-field': [
            'number-format',
            ['at', 0, ['get', 'wind']],
            { 'min-fraction-digits': 1, 'max-fraction-digits': 1 },
          ],
          'text-size': 12,
        },
        paint: {},
        filter: ['all', ['!=', ['at', 0, ['get', 'wind']], null], ['>', ['at', 0, ['get', 'wind']], 2]],
        minzoom: 7,
      })
    })
    resolve(map)
  })
}
onMounted(async () => {
  // set map
  const latestDateTime = await fetchCurrentAmedasTime()
  datetime.value = latestDateTime.format('YYYY-MM-DD HH:mm')
  const amedas = await fetchAmedasData(latestDateTime)
  console.log(amedas)
  map = await initMainMap(amedas)
})
</script>

<template>
  <div ref="mapElem" class="map"></div>
  <div class="control">
    <div class="time">{{ datetime }}</div>
  </div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 100%;
}
.control {
  position: absolute;
  z-index: 10;
  top: 100px;
  left: 30px;
}
.time {
  background-color: '#0009';
  border-radius: 10px;
  font-size: 48px;
  color: #fff;
  padding: 5px 15px;
  background-color: #0009;
}
@media screen and (max-width: 480px) {
  .control {
    left: 10px;
  }
  .time {
    font-size: 24px;
    border-radius: 5px;
  }
}
</style>
