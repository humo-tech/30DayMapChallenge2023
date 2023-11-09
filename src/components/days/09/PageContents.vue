<script setup>
import { ref, onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import { AWS_LOCATIONSERVICE_APIKEY } from '@/consts'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapboxLayer } from '@deck.gl/mapbox'
import { HexagonLayer } from '@deck.gl/aggregation-layers'

const apiKey = AWS_LOCATIONSERVICE_APIKEY
// const mapName = 'EsriImagery'
const mapName = '30daymapchallenge'
const region = 'ap-northeast-1'
const baseUrl = import.meta.env.BASE_URL

let map
const mapElem = ref(null)

onMounted(async () => {
  map = new maplibregl.Map({
    container: mapElem.value,
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`,
    center: [137.536, 35.684],
    pitch: 46,
    zoom: 7.12,
    maxZoom: 15,
    customAttribution: ['<a href="https://overturemaps.org/" target="_blank">Overture Maps</a>'],
    hash: true,
    projection: 'mercator',
  })

  const data = await fetch(`${baseUrl}/days/09/honey.geojson`).then((res) => res.json())
  const hexagonLayer = new MapboxLayer({
    type: HexagonLayer,
    id: 'hex',
    data: data.features,
    extruded: true,
    radius: 5000,
    elevationScale: 50,
    getPosition: (d) => d.geometry.coordinates,
  })
  map.on('load', () => {
    map.addLayer(hexagonLayer)
  })
})
</script>

<template>
  <div ref="mapElem" class="map"></div>
  <img :src="`${baseUrl}/days/09/sweets_hachimitsu_mitsurou_su.png`" />
</template>

<style scoped>
.map {
  width: 100%;
  height: 100%;
}
img {
  position: absolute;
  top: 120px;
  left: 50px;
  width: 200px;
}
</style>
