<script setup>
import { ref, onMounted, watch, getCurrentInstance } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'

let map
const uid = getCurrentInstance().uid
const props = defineProps({
  projection: { type: String, default: 'mercator' },
  position: {
    type: Object,
    default: () => {
      return {
        center: {
          lat: 35,
          lng: 135,
        },
        zoom: 2,
        uid: null,
      }
    },
  },
  interactive: { type: Boolean, default: false },
})
const emit = defineEmits(['update:position'])

const mapElem = ref(null)

watch(
  () => props.position,
  () => {
    if (props.position.uid !== uid) {
      map.jumpTo(props.position, { trigger: 'sync' })
    }
  }
)

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN
onMounted(() => {
  map = new mapboxgl.Map({
    container: mapElem.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: props.position.center,
    zoom: props.position.zoom,
    projection: props.projection,
    interactive: props.interactive,
  })
  map.dragRotate.disable()
  map.touchZoomRotate.disableRotation()
  map.on('style.load', () => {
    map.addSource('line', {
      type: 'geojson',
      data: {
        type: 'LineString',
        coordinates: [
          [props.position.center.lng, props.position.center.lat],
          [props.position.center.lng, 62],
        ],
      },
    })
    map.addLayer({
      id: 'lineEddge',
      source: 'line',
      type: 'line',
      paint: {
        'line-color': '#000',
        'line-width': 3,
      },
      layout: {
        'line-cap': 'round',
      },
    })
    map.addLayer({
      id: 'line',
      source: 'line',
      type: 'line',
      paint: {
        'line-color': '#f00',
        'line-width': 2,
      },
    })
    map.addSource('dot', {
      type: 'geojson',
      data: {
        type: 'Point',
        coordinates: [props.position.center.lng, props.position.center.lat],
      },
    })
    map.addLayer({
      id: 'dot',
      source: 'dot',
      type: 'circle',
      paint: {
        'circle-color': '#f00',
        'circle-radius': 3,
        'circle-stroke-color': '#000',
        'circle-stroke-width': 1,
      },
    })
  })

  map.on('move', (e) => {
    if (e.trigger === 'sync') return
    emit('update:position', { center: map.getCenter(), zoom: map.getZoom(), uid })
  })
})
</script>

<template>
  <div class="wrap">
    <div ref="mapElem" class="map"></div>
    <div class="projection">{{ projection }}</div>
  </div>
</template>

<style scoped>
.wrap {
  width: 100%;
  height: 100%;
  position: relative;
}
.map {
  width: 100%;
  height: 100%;
  border-radius: 10px;
}
.projection {
  position: absolute;
  top: 5px;
  right: 5px;
  color: #fff;
  background-color: #0009;
  padding: 5px 8px;
  border-radius: 5px;
}
</style>
