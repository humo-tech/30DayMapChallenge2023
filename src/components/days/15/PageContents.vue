<script setup>
import { ref, onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import * as pmtiles from 'pmtiles'
import { AWS_LOCATIONSERVICE_APIKEY } from '@/consts'
import 'maplibre-gl/dist/maplibre-gl.css'

const baseUrl = import.meta.env.BASE_URL
const apiKey = AWS_LOCATIONSERVICE_APIKEY
const mapName = 'OpenDataStandardLight'
const region = 'ap-northeast-1'

let map
const mapElem = ref(null)

const minColor = '#c00'
const midColor = '#fff'
const maxColor = '#00c'

const commonLayerStyle = {
  type: 'fill',
  source: 'osm',
  paint: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['/', ['to-number', ['get', 'restaurants']], ['to-number', ['get', 'cafe']]],
      0.01,
      minColor,
      1,
      midColor,
      10,
      maxColor,
    ],
    'fill-opacity': 0.5,
  },
  filter: ['>', ['to-number', ['get', 'restaurants']], 0],
}

onMounted(async () => {
  const style = {
    version: 8,
    sources: {
      osm: {
        type: 'vector',
        url: `pmtiles://${location.origin}${baseUrl}/days/15/restaurant_cafe.pmtiles`,
        attribution: '<a href="https://www.openstreetmap.org/" target="_blank">Open Street Map</a>',
      },
    },
    layers: [
      {
        id: 'q9',
        'source-layer': 'restaurant_cafe_q9',
        ...commonLayerStyle,
      },
      {
        id: 'q10',
        'source-layer': 'restaurant_cafe_q10',
        ...commonLayerStyle,
      },
      {
        id: 'q11',
        'source-layer': 'restaurant_cafe_q11',
        ...commonLayerStyle,
      },
      {
        id: 'q12',
        'source-layer': 'restaurant_cafe_q12',
        ...commonLayerStyle,
      },
    ],
  }
  const protocol = new pmtiles.Protocol()
  maplibregl.addProtocol('pmtiles', protocol.tile)
  map = new maplibregl.Map({
    container: mapElem.value,
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`,
    center: [0, 0],
    zoom: 0,
    maxZoom: 9,
    customAttribution: [],
    hash: true,
    projection: 'mercator',
  })

  map.on('load', () => {
    const popup = new maplibregl.Popup({ closeOnClick: false }).addTo(map)
    Object.entries(style.sources).forEach((entry) => {
      map.addSource(...entry)
    })
    style.layers.forEach((layer) => {
      console.log(layer.id)
      map.addLayer(layer)
      map.on('click', layer.id, (e) => {
        console.log(e.lngLat)
        console.log(e.features[0].properties)
        popup.setLngLat(e.lngLat).setHTML(JSON.stringify(e.features[0].properties)).addTo(map)
      })
    })
  })
})
</script>

<template>
  <div ref="mapElem" class="map"></div>
  <div class="scale">
    <div class="scale-body">
      <span>Cafe &gt;</span>
      <div class="scale-bar"></div>
      <span>&lt; Restaurant</span>
    </div>
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
  font-size: 20px;
  background-color: #3339;
  padding: 10px 20px;
}
.scale-title {
  font-size: 24px;
  margin-bottom: 7px;
}
.scale-body {
  display: flex;
}
.scale-bar {
  width: 200px;
  height: 1em;
  background: linear-gradient(to right, v-bind(minColor), v-bind(midColor), v-bind(maxColor));
  border: 1px solid #fff;
  margin: 0 5px;
}
</style>
