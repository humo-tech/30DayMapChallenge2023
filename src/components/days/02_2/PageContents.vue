<script setup>
import { ref, onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import { AWS_LOCATIONSERVICE_APIKEY } from '@/consts'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ModelLayer } from './ModelLayer.js'

const apiKey = AWS_LOCATIONSERVICE_APIKEY
const mapName = '30daymapchallenge'
const region = 'ap-northeast-1'
const baseUrl = import.meta.env.BASE_URL

let map
const mapElem = ref(null)

// parameters to ensure the model is georeferenced correctly on the map
const modelOrigin = [145, 35]
const modelAltitude = 50000
const modelRotate = [Math.PI / 2, 0, 0]

const modelAsMercatorCoordinate = maplibregl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude)

// transformation parameters to position, rotate and scale the 3D model onto the map
const modelTransform = {
  translateX: modelAsMercatorCoordinate.x,
  translateY: modelAsMercatorCoordinate.y,
  translateZ: modelAsMercatorCoordinate.z,
  rotateX: modelRotate[0],
  rotateY: modelRotate[1],
  rotateZ: modelRotate[2],
  /* Since our 3D model is in real world meters, a scale transform needs to be
   * applied since the CustomLayerInterface expects units in MercatorCoordinates.
   */
  scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * 50000,
}

onMounted(async () => {
  map = new maplibregl.Map({
    container: mapElem.value,
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`,
    center: [132.98, 31.28],
    pitch: 42,
    zoom: 4.46,
    maxZoom: 15,
    customAttribution: [
      '<a href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-S10b-v1_1.html">国土数値情報 空港間流通量データ</a>',
      '<a href="https://www.cgtrader.com/items/3382304/download-page">cgtrader</a>',
    ],
    hash: true,
    projection: 'mercator',
  })

  const modelLayer = new ModelLayer('airplane', `${baseUrl}/days/02/plane.gltf`, modelTransform)
  map.on('load', () => {
    map.addLayer(modelLayer)
    map.addSource('line', { type: 'geojson', data: `${baseUrl}/days/02/W05-08_13_GML.geojson` })
    map.addLayer({
      id: 'line',
      source: 'line',
      type: 'line',
      paint: {
        'line-color': '#939',
        'line-width': 10,
        'line-blur': 10,
      },
    })
    map.addLayer({
      id: 'line2',
      source: 'line',
      type: 'line',
      paint: {
        'line-color': '#f3f',
        'line-width': 5,
        'line-blur': 5,
      },
    })
    map.addLayer({
      id: 'line3',
      source: 'line',
      type: 'line',
      paint: {
        'line-color': '#fff',
        'line-width': 1,
      },
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
