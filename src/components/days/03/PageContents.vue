<script setup>
import { ref, onMounted } from 'vue'
import maplibregl from 'maplibre-gl'
import * as pmtiles from 'pmtiles'
import { AWS_LOCATIONSERVICE_APIKEY } from '@/consts'
import 'maplibre-gl/dist/maplibre-gl.css'

const apiKey = AWS_LOCATIONSERVICE_APIKEY
// const mapName = 'EsriImagery'
const mapName = '30daymapchallenge'
const region = 'ap-northeast-1'

let map
const mapElem = ref(null)

const colors = {
  bareRock: '#A9A9A9',
  beach: '#FFF5EE',
  // 'dune': // '#F5DEB3',
  // 'fell': // '#8B7765',
  forest: '#228B22',
  // 'glacier': // '#AFEEEE',
  grass: '#7CFC00',
  // 'grassland': // '#7CFC00',
  heath: '#556B2F',
  // 'hill': // '#6B8E23',
  land: '#DEB887',
  meadow: '#9ACD32',
  peak: '#FFFFFF',
  // 'reef': // '#48D1CC',
  rock: '#808080',
  sand: '#EDC9Af',
  scree: '#778899',
  scrub: '#3CB371',
  shingle: '#2F4F4F',
  // 'shrub': // '#006400',
  shrubbery: '#3CB371',
  tree: '#006400',
  tree_row: '#556B2F',
  // 'tundra': // '#808000',
  valley: '#66CDAA',
  // 'volcano': // '#B22222',
  wetland: '#5F9EA0',
  wood: '#82b42d',
  other: '#000',
}

// addProtocol for reading PMTiles
// https://qiita.com/Kanahiro/items/577f7828c5a1e323721a
const protocol = new pmtiles.Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)

onMounted(async () => {
  map = new maplibregl.Map({
    container: mapElem.value,
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`,
    center: [139.76, 35.73],
    pitch: 60,
    zoom: 8.75,
    maxZoom: 15,
    customAttribution: ['<a href="https://overturemaps.org/">Overture Maps</a>'],
    hash: true,
    projection: 'mercator',
  })

  map.on('load', () => {
    map.addSource('class', { type: 'vector', url: 'pmtiles://https://humo.tech/30daymapchallenge/class_kanto.pmtiles' })
    map.addLayer({
      id: 'class',
      source: 'class',
      'source-layer': 'class',
      type: 'fill',
      paint: {
        'fill-color': [
          'match',
          ['get', 'class'],
          ...Object.entries(colors).reduce((curr, prev) => {
            prev.push(...curr)
            return prev
          }, []),
          '#000',
        ],
        'fill-opacity': 0.7,
      },
    })
  })
})
</script>

<template>
  <div ref="mapElem" class="map"></div>
  <ul>
    <li v-for="(value, key) in colors" :key="key">
      <span class="mark" :style="{ color: value }">■</span><span class="text">{{ key }}</span>
    </li>
  </ul>
</template>

<style scoped>
.map {
  width: 100%;
  height: 100%;
}
ul {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: #0006;
  padding: 10px;
  list-style-type: none;
}
.mark {
  margin-right: 5px;
}
.text {
  color: #fff;
}
</style>
