<script setup>
import { ref, onMounted } from 'vue'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
const baseUrl = import.meta.env.BASE_URL
const iconImage = `url(${baseUrl}/days/04/clippy.png)`

let map
let marker
const mapElem = ref(null)

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN
onMounted(async () => {
  map = new mapboxgl.Map({
    container: mapElem.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [139.76, 35.73],
    zoom: 8.75,
    hash: true,
  })

  map.on('load', () => {
    createMarker()
  })
})

const resetMarkerPosition = () => {
  marker.setLngLat(map.getCenter())
}

const createMarker = () => {
  const el = document.createElement('div')
  el.className = 'marker'
  const child = document.createElement('div')
  child.className = 'marker-child'
  el.appendChild(child)
  const grandchild = document.createElement('div')
  grandchild.className = 'marker-grandchild'
  child.appendChild(grandchild)
  marker = new mapboxgl.Marker({ element: el, draggable: true }).setLngLat(map.getCenter()).addTo(map)
  marker.on('dragend', resetMarkerPosition)
  map.on('moveend', resetMarkerPosition)
}
</script>

<template>
  <div ref="mapElem" class="map"></div>
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

<style>
.marker-grandchild {
  background-image: v-bind(iconImage);
  background-size: cover;
  width: 240px;
  height: 240px;
  cursor: pointer;
  filter: drop-shadow(3px 3px 1px #000);
  animation: skew 3s alternate infinite ease-in-out;
}
.marker-child:hover {
  animation: scale 0.5s alternate infinite ease-in-out;
}

@keyframes skew {
  from {
    transform: skew(-10deg, 0deg);
  }
  to {
    transform: skew(10deg, 0deg);
  }
}
@keyframes scale {
  to {
    transform: scale(1.5);
  }
}
</style>
