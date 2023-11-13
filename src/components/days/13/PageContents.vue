<script setup>
import { ref, onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import * as pmtiles from 'pmtiles'

const protocol = new pmtiles.Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)

const baseUrl = import.meta.env.BASE_URL

let map
const mapElem = ref(null)

const style = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    japan: {
      type: 'vector',
      url: `pmtiles://${baseUrl}/common/N03-18_180101_z9_pref_city.pmtiles`,
      attribution:
        '<a href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v2_2.html" target="_blank">国土数値情報</a>',
      promoteId: 'N03_007',
    },
  },
  layers: [
    {
      id: 'pref_fill',
      source: 'japan',
      'source-layer': 'N0318_180101_pref',
      type: 'fill',
      paint: {
        'fill-color': ['interpolate', ['linear'], ['feature-state', 'ratio'], 0, '#fff', 10, '#f00'],
      },
      maxzoom: 6,
    },
    {
      id: 'city_fill',
      source: 'japan',
      'source-layer': 'N0318_180101',
      type: 'fill',
      paint: {
        'fill-color': ['interpolate', ['linear'], ['feature-state', 'ratio'], 0, '#fff', 20, '#f00'],
      },
      minzoom: 5,
    },
    {
      id: 'city_line',
      source: 'japan',
      'source-layer': 'N0318_180101',
      type: 'line',
      paint: {
        'line-color': '#999',
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.2, 9, 1],
      },
      minzoom: 5,
    },
    {
      id: 'pref_line',
      source: 'japan',
      'source-layer': 'N0318_180101_pref',
      type: 'line',
      paint: {
        'line-color': '#666',
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 9, 3],
      },
    },
    {
      id: 'city_label',
      source: 'japan',
      'source-layer': 'N0318_180101',
      type: 'symbol',
      layout: {
        'text-field': ['get', 'N03_004'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 7, 10, 14, 20],
      },
      paint: {},
      minzoom: 7,
    },
  ],
}

onMounted(async () => {
  map = new maplibregl.Map({
    container: mapElem.value,
    style,
    center: [136.8, 37.2],
    zoom: 4.7,
    hash: true,
    customAttribution: [
      '<a href="https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&toukei=00200521&tstat=000001049104&cycle=0&tclass1=000001049105&tclass2val=0" target="_blank">令和2年国勢調査</a>',
    ],
  })

  map.on('load', () => {
    fetch(`${baseUrl}/days/13/foreigner.csv`)
      .then((res) => res.text())
      .then((text) => {
        const [header, ...body] = text.split(/[\r\n]/)
        // eslint-disable-next-line no-unused-vars
        const headers = header.split(/,/)
        body.forEach((line) => {
          // eslint-disable-next-line no-unused-vars
          const [code, name, japanese, foreigner] = line.split(/,/)
          map.setFeatureState(
            { source: 'japan', sourceLayer: 'N0318_180101_pref', id: code },
            { ratio: (foreigner / japanese) * 100 || 0 }
          )
          map.setFeatureState(
            { source: 'japan', sourceLayer: 'N0318_180101', id: code },
            { ratio: (foreigner / japanese) * 100 || 0 }
          )
        })
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
