<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import mapboxgl from 'mapbox-gl-3.0.0-rc.2'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'
import 'mapbox-gl-3.0.0-rc.2/dist/mapbox-gl.css'
import csv2geojson from 'csv2geojson'
import { fileList } from './fileList'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

const tz = 'Asia/Tokyo'

let map
const mapElem = ref(null)
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

let clearId = null
const timeIndex = ref(0)
const datetime = computed(() => {
  return dayjs.utc(fileList[timeIndex.value]).tz(tz).format('YYYY/MM/DD HH:mm')
})

const anim = () => {
  if (timeIndex.value < fileList.length - 1) {
    timeIndex.value++
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

watch(timeIndex, async () => {
  console.log(timeIndex.value)
  if (!map.getSource('stations') || !map.isSourceLoaded('stations')) return
  const geojson = await getData(fileList[timeIndex.value])
  map.getSource('stations').setData(geojson)
  // updateMarkers()
})

const cachedFetch = (url) => {
  if (!cachedFetch.cache) cachedFetch.cache = {}
  cachedFetch.cache[url] = fetch(url)
  return cachedFetch.cache[url]
}

const getData = async (data) => {
  return new Promise((resolve, reject) => {
    cachedFetch(`https://n4tlrgsn34nb6rjw76h5vb5wfy0brovb.lambda-url.ap-northeast-1.on.aws/gbfs_csv?data=${data}`)
      .then((res) => res.text())
      .then((csv) => {
        csv2geojson.csv2geojson(
          csv,
          { numericFields: 'num_bikes_now,num_bikes_limit,num_bikes_parkable,num_bikes_rentalable' },
          (err, data) => {
            if (err) throw new Error(err)
            resolve(data)
          }
        )
      })
  })
}

const markers = {}
let markersOnScreen = {}
const colors = ['#fcf411', '#1196fc']

function updateMarkers() {
  const newMarkers = {}
  const features = map.querySourceFeatures('stations')

  // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
  // and add it to the map if it's not there already
  for (const feature of features) {
    const coords = feature.geometry.coordinates
    const props = feature.properties
    if (!props.cluster) continue
    const id = props.cluster_id

    let marker = markers[id]
    if (!marker) {
      const el = createDonutChart(props)
      marker = markers[id] = new mapboxgl.Marker({
        element: el,
      }).setLngLat(coords)
    }
    newMarkers[id] = marker

    if (!markersOnScreen[id]) marker.addTo(map)
  }
  // for every marker we've added previously, remove those that are no longer visible
  for (const id in markersOnScreen) {
    if (!newMarkers[id]) markersOnScreen[id].remove()
  }
  markersOnScreen = newMarkers
}

function createDonutChart(props) {
  const offsets = []
  const counts = [props.num_bikes_rentalable, props.num_bikes_parkable]
  let total = 0
  const ratio = Math.round((props.num_bikes_rentalable / (props.num_bikes_parkable + props.num_bikes_rentalable)) * 100)
  for (const count of counts) {
    offsets.push(total)
    total += count
  }
  const fontSize = ratio >= 100 ? 16 : ratio >= 10 ? 14 : 12
  const r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18
  const r0 = Math.round(r * 0.6)
  const w = r * 2

  let html = `<div>
<svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}" text-anchor="middle" style="font: ${fontSize}px sans-serif; display: block">`

  for (let i = 0; i < counts.length; i++) {
    html += donutSegment(offsets[i] / total, (offsets[i] + counts[i]) / total, r, r0, colors[i])
  }
  html += `<circle cx="${r}" cy="${r}" r="${r0}" fill="white" />
<text dominant-baseline="central" transform="translate(${r}, ${r})">
${ratio}%
</text>
</svg>
</div>`

  const el = document.createElement('div')
  el.innerHTML = html
  return el.firstChild
}

function donutSegment(start, end, r, r0, color) {
  if (end - start === 1) end -= 0.00001
  const a0 = 2 * Math.PI * (start - 0.25)
  const a1 = 2 * Math.PI * (end - 0.25)
  const x0 = Math.cos(a0)
  const y0 = Math.sin(a0)
  const x1 = Math.cos(a1)
  const y1 = Math.sin(a1)
  const largeArc = end - start > 0.5 ? 1 : 0

  // draw an SVG path
  return `<path d="M ${r + r0 * x0} ${r + r0 * y0} L ${r + r * x0} ${r + r * y0} A ${r} ${r} 0 ${largeArc} 1 ${
    r + r * x1
  } ${r + r * y1} L ${r + r0 * x1} ${r + r0 * y1} A ${r0} ${r0} 0 ${largeArc} 0 ${r + r0 * x0} ${
    r + r0 * y0
  }" fill="${color}" stroke="#ccc" />`
}

onMounted(() => {
  map = new mapboxgl.Map({
    container: mapElem.value,
    // style: 'mapbox://styles/mapbox/dark-v11',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [139.65, 35.65],
    zoom: 9,
    pitch: 0,
    hash: true,
    language: 'ja',
  })
  map.on('load', async () => {
    const geojson = await getData(fileList[timeIndex.value])
    map.addSource('stations', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterRadius: 40,
      clusterProperties: {
        num_bikes_parkable: ['+', ['get', 'num_bikes_parkable']],
        num_bikes_rentalable: ['+', ['get', 'num_bikes_rentalable']],
      },
    })
    // map.addLayer({
    //  id: 'stations',
    //  source: 'stations',
    //  type: 'heatmap',
    //  paint: {
    //    'heatmap-weight': ['/', ['get', 'num_bikes_now'], ['get', 'num_bikes_limit']],
    //    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 5, 0.1, 15, 1],
    //    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 0, 6, 1, 15, 30],
    //  },
    // })
    map.addLayer({
      id: 'station_label',
      type: 'symbol',
      source: 'stations',
      filter: ['!=', 'cluster', true],
      layout: {
        'text-field': [
          'format',
          [
            'to-string',
            [
              'round',
              [
                '*',
                [
                  '/',
                  ['get', 'num_bikes_parkable'],
                  ['+', ['get', 'num_bikes_rentalable'], ['get', 'num_bikes_parkable']],
                ],
                100,
              ],
            ],
          ],
          { 'font-scale': 1 },
          ' %',
          { 'font-scale': 0.7 },
        ],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 18,
      },
      paint: {
        'text-color': colors[0],
        'text-halo-color': '#000',
        'text-halo-width': 1,
      },
    })
  })
  map.on('render', () => {
    if (!map.getSource('stations') || !map.isSourceLoaded('stations')) return
    updateMarkers()
  })
})
</script>

<template>
  <div ref="mapElem" class="map"></div>
  <div class="control">
    <div class="datetime">{{ datetime }}</div>
    <input type="range" min="0" :max="fileList.length - 1" v-model.number="timeIndex" />
    <button @click="toggleAnim()">▶</button>
    <div class="legend">
      <div class="rentalable">Rentalable(貸出可能)</div>
      <div class="parkable">Parkable(駐輪可能)</div>
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
  background-color: #0009;
  padding: 10px 20px;
}
.datetime {
  font-size: 32px;
  color: #fff;
  font-style: italic;
}
input[type='range'] {
  width: 200px;
}
.legend {
  color: #fff;
}
.legend div:before {
  content: '';
  display: inline-block;
  width: 30px;
  height: 5px;
  background-color: #000;
  vertical-align: middle;
  margin-right: 5px;
  position: relative;
  top: -2px;
}
.legend div.rentalable:before {
  background-color: v-bind(colors[0]);
}
.legend div.parkable:before {
  background-color: v-bind(colors[1]);
}
</style>
