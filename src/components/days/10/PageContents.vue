<script setup>
import { ref, onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import { AWS_LOCATIONSERVICE_APIKEY } from '@/consts'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MagicCircleLayer } from './MagicCircleLayer'

const apiKey = AWS_LOCATIONSERVICE_APIKEY
const mapName = 'EsriImagery'
const region = 'ap-northeast-1'

let map
const mapElem = ref(null)

const circles = [
  {
    bbox: [
      { lng: -98.96136707946826, lat: 42.60907325763699 },
      { lng: -98.95175404235901, lat: 42.60901008708586 },
      { lng: -98.95183987304732, lat: 42.6022504679745 },
      { lng: -98.96136707946826, lat: 42.6022504679745 },
    ],
    options: {
      colorBalance: [0.7, 0.1, 0.2],
      rotationBalance: [0.3, 1.0, 1],
      splitNumber: 2,
    },
  },
  {
    bbox: [
      { lng: -98.95163371098809, lat: 42.61623046899166 },
      { lng: -98.94183515794747, lat: 42.616407783671974 },
      { lng: -98.9416745259303, lat: 42.60978769318663 },
      { lng: -98.95163371098809, lat: 42.60925569108437 },
    ],
    options: {
      colorBalance: [0.1, 0.3, 0.7],
      rotationBalance: [0.1, 0.1, 1.0],
      splitNubmer: 4,
    },
  },
  {
    bbox: [
      { lng: -98.98109397425564, lat: 42.61600936744139 },
      { lng: -98.97164419629976, lat: 42.61618616803406 },
      { lng: -98.97132386484343, lat: 42.60934951291756 },
      { lng: -98.98117405711952, lat: 42.60923163297204 },
    ],
    options: {
      colorBalance: [0.1, 0.8, 0.2],
      rotationBalance: [0.5, 0.8, 1.0],
      splitNubmer: 5,
    },
  },
  {
    bbox: [
      { lng: -98.94137287369448, lat: 42.60204053446435 },
      { lng: -98.93192309573817, lat: 42.60209948126908 },
      { lng: -98.93176293001, lat: 42.595497092496544 },
      { lng: -98.94161312228651, lat: 42.59520232668544 },
    ],
    options: {
      colorBalance: [0.8, 0.8, 0.2],
      rotationBalance: [0.2, 0.8, 3.0],
      splitNubmer: 2,
    },
  },
  {
    bbox: [
      { lng: -98.97100353338749, lat: 42.594435929050775 },
      { lng: -98.96139358970302, lat: 42.59437697499598 },
      { lng: -98.9610732582471, lat: 42.587655847208936 },
      { lng: -98.97124378197954, lat: 42.58759688674141 },
    ],
    options: {
      colorBalance: [0.8, 0.8, 0.8],
      rotationBalance: [0.2, 0.1, 3.0],
      splitNubmer: 10,
    },
  },
  {
    bbox: [
      { lng: -98.92222828552308, lat: 42.62341131480787 },
      { lng: -98.9128727404792, lat: 42.623474470751944 },
      { lng: -98.91270107910215, lat: 42.616842746838984 },
      { lng: -98.92197079345769, lat: 42.61677958416857 },
    ],
    options: {
      colorBalance: [0.5, 0.0, 0.8],
      rotationBalance: [0.2, 0.1, 3.0],
      splitNubmer: 12,
    },
  },
]

onMounted(async () => {
  map = new maplibregl.Map({
    container: mapElem.value,
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`,
    center: [-98.94552, 42.60661],
    zoom: 13.16,
    hash: true,
  })

  map.on('load', () => {
    circles.forEach((circle, index) => {
      map.addLayer(new MagicCircleLayer(`circle${index}`, circle.bbox, circle.options))
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
