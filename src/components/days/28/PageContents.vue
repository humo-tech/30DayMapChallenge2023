<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import isBetween from 'dayjs/plugin/isBetween'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'
import * as turf from '@turf/turf'
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

const baseUrl = import.meta.env.BASE_URL

dayjs.extend(utc)
dayjs.extend(isBetween)

let map
const mapElem = ref(null)

const loadData = () => {
  return new Promise((resolve) => {
    Promise.all([
      fetch(`${baseUrl}/days/28/N03-18_180101.geojson`).then((res) => res.json()),
      fetch(`${baseUrl}/days/28/worker.csv`)
        .then((res) => res.text())
        .then((text) => {
          const [header, ...body] = text.split(/[\r\n]/)
          // eslint-disable-next-line no-unused-vars
          const headers = header.split(/,/)
          const data = {}
          body.forEach((line) => {
            // eslint-disable-next-line no-unused-vars
            const [code, name, primary, secondary, teritiary] = line.split(/,/)
            data[code] = {
              name,
              primary: Number(primary) / 100,
              secondary: Number(secondary) / 100,
              teritiary: Number(teritiary) / 100,
            }
          })
          return data
        }),
    ]).then(([geojson, data]) => {
      geojson.features.forEach((feature) => {
        feature.geometry = turf.circle(feature.geometry.coordinates, 2).geometry
        feature.properties = { ...data?.[feature.properties.N03_007] }
      })
      resolve(geojson)
    })
  })
}

onMounted(async () => {
  map = new mapboxgl.Map({
    container: mapElem.value,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [135, 37],
    zoom: 7,
    pitch: 65,
    hash: true,
    projection: 'mercator',
  })

  map.on('load', async () => {
    const geojson = await loadData()
    console.log(geojson)
    const totalHeight = 30000
    map.addSource('city', {
      type: 'geojson',
      data: geojson,
      attribution:
        '<a href="https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&toukei=00200521&tstat=000001049104&cycle=0&tclass1=000001049105&tclass2val=0" target="_blank">令和2年国勢調査</a>',
    })
    map.addLayer({
      id: 'primary',
      source: 'city',
      type: 'fill-extrusion',
      paint: {
        'fill-extrusion-color': '#d00',
        'fill-extrusion-height': ['*', ['get', 'primary'], totalHeight],
        'fill-extrusion-opacity': 0.8,
      },
    })
    map.addLayer({
      id: 'secondary',
      source: 'city',
      type: 'fill-extrusion',
      paint: {
        'fill-extrusion-color': '#0d0',
        'fill-extrusion-base': ['*', ['get', 'primary'], totalHeight],
        'fill-extrusion-height': ['*', ['+', ['get', 'secondary'], ['get', 'primary']], totalHeight],
        'fill-extrusion-opacity': 0.8,
      },
    })
    map.addLayer({
      id: 'teritiary',
      source: 'city',
      type: 'fill-extrusion',
      paint: {
        'fill-extrusion-color': '#99f',
        'fill-extrusion-base': ['*', ['+', ['get', 'secondary'], ['get', 'primary']], totalHeight],
        'fill-extrusion-height': totalHeight,
        'fill-extrusion-opacity': 0.3,
      },
    })
  })
})
</script>

<template>
  <div ref="mapElem" class="map"></div>
  <div class="scale">
    <div>Industory (産業)</div>
    <ul>
      <li class="teritiary">Teritiary (三次)</li>
      <li class="secondary">Secondary (二次)</li>
      <li class="primary">Primary (一次)</li>
    </ul>
  </div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 100%;
}
.scale {
  position: absolute;
  bottom: 30px;
  right: 40px;
  color: #fff;
  font-size: 24px;
  background-color: #3339;
  padding: 10px 20px;
}
.scale ul {
  margin: 0;
  padding: 3px 10px;
  list-style-type: none;
}
.scale li::before {
  content: '';
  display: inline-block;
  width: 0.8em;
  height: 0.8em;
  position: relative;
  background-color: #fff;
  border: 1px solid #ccc;
  top: 1px;
  margin-right: 5px;
}
.scale li.primary:before {
  background-color: #d00;
}
.scale li.secondary:before {
  background-color: #0d0;
}
.scale li.teritiary:before {
  background-color: #99f3;
}
</style>
