<script setup>
import { ref, onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import { AWS_LOCATIONSERVICE_APIKEY } from '@/consts'
import 'maplibre-gl/dist/maplibre-gl.css'

const baseUrl = import.meta.env.BASE_URL

const apiKey = AWS_LOCATIONSERVICE_APIKEY
const mapName = 'EsriImagery'
const region = 'ap-northeast-1'

let map
const mapElem = ref(null)
let count = 0

const all = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }],
}
let allCoordinates = []
let swim, bike, run
let swimLen, bikeLen, allLen
let clearId
const anim = () => {
  if (count < allLen) {
    // console.log(count / allLen)
    const speed = count < swimLen ? 100 : count < swimLen + bikeLen ? 5 : 20
    all.features[0].geometry.coordinates = allCoordinates.slice(0, count)
    map.getSource('all').setData(all)
    map.jumpTo({ center: allCoordinates[count], zoom: 9 })
    clearId = setTimeout(anim, speed)
  }
  count++
}

onMounted(async () => {
  map = new maplibregl.Map({
    container: mapElem.value,
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`,
    center: [12.645212, 55.652314],
    zoom: 10,
    customAttribution: ['<a href="https://www.ironman.com/im-copenhagen" target="_blank">IRONMAN COPENHAGEN</a>'],
    // hash: true,
  })

  map.on('load', async () => {
    ;[swim, bike, run] = await Promise.all([
      fetch(`${baseUrl}/days/14/2023_IRONMAN_Copenhagen_-_swim_course__1_tracks.geojson`).then((res) => res.json()),
      fetch(`${baseUrl}/days/14/2023_IRONMAN_Copenhagen_-_bike_course__1_tracks.geojson`).then((res) => res.json()),
      fetch(`${baseUrl}/days/14/2023_IRONMAN_Copenhagen_-_run_course__1_tracks.geojson`).then((res) => res.json()),
    ])
    swimLen = swim.features[0].geometry.coordinates[0].length
    bikeLen = bike.features[0].geometry.coordinates[0].length
    allCoordinates = allCoordinates.concat(...swim.features[0].geometry.coordinates)
    allCoordinates = allCoordinates.concat(...bike.features[0].geometry.coordinates)
    allCoordinates = allCoordinates.concat(...run.features[0].geometry.coordinates)
    allLen = allCoordinates.length
    map.addSource('all', {
      type: 'geojson',
      data: all,
    })
    map.addSource('swim', {
      type: 'geojson',
      data: swim,
    })
    map.addSource('bike', {
      type: 'geojson',
      data: bike,
    })
    map.addSource('run', {
      type: 'geojson',
      data: run,
    })
    map.addLayer({
      id: 'swim',
      source: 'swim',
      type: 'line',
      paint: {
        'line-color': '#5cc',
        'line-width': 5,
        'line-blur': 10,
      },
    })
    map.addLayer({
      id: 'swim2',
      source: 'swim',
      type: 'line',
      paint: {
        'line-color': '#0ff',
        'line-width': 5,
        'line-blur': 5,
      },
    })
    map.addLayer({
      id: 'bike',
      source: 'bike',
      type: 'line',
      paint: {
        'line-color': '#5c5',
        'line-width': 5,
        'line-blur': 10,
      },
    })
    map.addLayer({
      id: 'bike2',
      source: 'bike',
      type: 'line',
      paint: {
        'line-color': '#0f0',
        'line-width': 5,
        'line-blur': 5,
      },
    })
    map.addLayer({
      id: 'run',
      source: 'run',
      type: 'line',
      paint: {
        'line-color': '#c55',
        'line-width': 5,
        'line-blur': 10,
      },
    })
    map.addLayer({
      id: 'run2',
      source: 'run',
      type: 'line',
      paint: {
        'line-color': '#f00',
        'line-width': 5,
        'line-blur': 5,
      },
    })
    map.addLayer({
      id: 'all',
      source: 'all',
      type: 'line',
      paint: {
        'line-color': '#fff',
        'line-width': 1,
      },
    })
    clearTimeout(clearId)
    anim()
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
