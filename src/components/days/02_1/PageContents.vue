<script setup>
import { ref, onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import { AWS_LOCATIONSERVICE_APIKEY } from '@/consts'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapboxLayer } from '@deck.gl/mapbox'
import { ArcLayer } from '@deck.gl/layers'

const apiKey = AWS_LOCATIONSERVICE_APIKEY
const mapName = '30daymapchallenge'
const region = 'ap-northeast-1'
const baseUrl = import.meta.env.BASE_URL

let map
const mapElem = ref(null)

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
    ],
    hash: true,
    projection: 'mercator',
  })

  const data = await fetch(`${baseUrl}/days/02/W05-08_13_GML.geojson`).then((res) => res.json())
  const arcLayer = new MapboxLayer({
    type: ArcLayer,
    id: 'arc',
    data: data.features,
    getSourcePosition: (d) => d.geometry.coordinates[0][0],
    getTargetPosition: (d) => d.geometry.coordinates[0][1],
    getSourceColor: [255, 255, 0, 0],
    getTargetColor: [255, 0, 255, 50],
    getWidth: (d) => 3,
    getHeight: (d) => 0.5,
  })
  map.on('load', () => {
    map.addLayer(arcLayer)
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
