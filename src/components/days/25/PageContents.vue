<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_ACCESS_TOKEN } from '@/consts'
import 'mapbox-gl/dist/mapbox-gl.css'
import dayjs from 'dayjs'
import * as turf from '@turf/turf'

let map
const mapElem = ref(null)
let minimap
const minimapElem = ref(null)
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

const datetime = ref('')
const description = ref('')

const getShiraseData = () => {
  const points = { type: 'FeatureCollection', features: [] }
  const line = { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
  return fetch('https://shirase-position-ed154.firebaseio.com/data/JARE64.json')
    .then((res) => res.json())
    .then((json) => {
      Object.values(json.group.shirase).forEach((point) => {
        points.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.lng, point.lat],
          },
          properties: {
            ...point,
          },
        })
        line.geometry.coordinates.push([point.lng, point.lat])
      })
      return {
        points,
        line,
        attribution: '<a href="https://www.nipr.ac.jp/antarctic/jare/map64.html" target="_blank">JAREマップ</a>',
      }
    })
}

const anime = (points, cameraOffset, animationDuration) => {
  let start
  const startTime = dayjs(points.features[0].properties.time).unix()
  const endTime = dayjs(points.features.slice(-1)[0].properties.time).unix()
  const totalTime = endTime - startTime

  const findPosition = (phase) => {
    const position = []
    let pointName = ''
    points.features.forEach((feature, index) => {
      const thisTime = dayjs(feature.properties.time).unix()
      const passedTime = thisTime - startTime
      if (phase >= passedTime / totalTime) {
        const thisPhase = thisTime / totalTime
        const nextFeature = points.features[index + 1]
        const nextTime = dayjs(nextFeature.properties.time).unix()
        const ratio = (thisPhase - phase) / (nextTime - thisTime)
        position[0] =
          feature.geometry.coordinates[0] +
          (nextFeature.geometry.coordinates[0] - feature.geometry.coordinates[0]) * ratio
        position[1] =
          feature.geometry.coordinates[1] +
          (nextFeature.geometry.coordinates[1] - feature.geometry.coordinates[1]) * ratio
        pointName = feature.properties.description
      }
    })
    return [position, pointName]
  }

  const frame = (time) => {
    if (!start) start = time
    // phase determines how far through the animation we are
    const phase = (time - start) / animationDuration

    // phase is normalized between 0 and 1
    // when the animation is finished, reset start to loop the animation
    if (phase > 1) {
      // wait 1.5 seconds before looping
      setTimeout(() => {
        start = 0.0
      }, 1500)
    }

    // use the phase to get a point that is the appropriate distance along the route
    // this approach syncs the camera and route positions ensuring they move
    // at roughly equal rates even if they don't contain the same number of points
    // const alongRoute = turf.along(targetRoute, routeDistance * phase).geometry.coordinates
    // const alongCamera = turf.along(targetCamera, cameraRouteDistance * phase).geometry.coordinates
    const [alongRoute, pointName] = findPosition(phase)
    datetime.value = dayjs.unix(startTime + phase * totalTime).format('YYYY-MM-DD HH')
    description.value = pointName

    const camera = map.getFreeCameraOptions()

    // set the position and altitude of the camera
    const alongCamera = turf.transformTranslate(turf.point(alongRoute), cameraOffset.x, cameraOffset.y).geometry
      .coordinates
    camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
      {
        lng: alongCamera[0],
        lat: alongCamera[1],
      },
      cameraOffset.z
    )

    minimap.getSource('points').setData(turf.point(alongRoute))

    // tell the camera to look at a point along the route
    camera.lookAtPoint({
      lng: alongRoute[0],
      lat: alongRoute[1],
    })

    map.setFreeCameraOptions(camera)

    window.requestAnimationFrame(frame)
  }
  window.requestAnimationFrame(frame)
}

const initMainMap = (shiraseData) => {
  return new Promise((resolve) => {
    const map = new mapboxgl.Map({
      container: mapElem.value,
      // style: 'mapbox://styles/mapbox/dark-v11',
      style: 'mapbox://styles/mapbox/satellite-streets-v11',
      center: [131.1, -20],
      zoom: 0,
      projection: 'globe',
    })
    map.on('style.load', async () => {
      map.setFog({
        'space-color': '#035',
        'star-intensity': 0.3,
      })

      map.addSource('line', { type: 'geojson', data: shiraseData.line, attribution: shiraseData.attribution })
      map.addSource('points', { type: 'geojson', data: shiraseData.points })

      map.addLayer({
        id: 'line',
        source: 'line',
        type: 'line',
        paint: {
          'line-color': '#ed6c00',
          'line-width': 3,
        },
      })
      map.addLayer({
        id: 'points',
        source: 'points',
        type: 'circle',
        paint: {
          'circle-color': '#fff',
          'circle-stroke-color': '#ed6c00',
          'circle-stroke-width': 1,
          'circle-radius': 3,
        },
      })
    })
    resolve(map)
  })
}
const initMiniMap = (shiraseData) => {
  return new Promise((resolve) => {
    const map = new mapboxgl.Map({
      container: minimapElem.value,
      // style: 'mapbox://styles/mapbox/dark-v11',
      style: 'mapbox://styles/mapbox/satellite-streets-v11',
      center: [131.1, -20],
      zoom: 0,
      projection: 'globe',
    })
    map.on('style.load', async () => {
      map.setFog({
        'space-color': '#035',
        'star-intensity': 0.3,
      })

      map.addSource('line', { type: 'geojson', data: shiraseData.line, attribution: shiraseData.attribution })
      map.addSource('points', { type: 'geojson', data: turf.featureCollection([]) })

      map.addLayer({
        id: 'line',
        source: 'line',
        type: 'line',
        paint: {
          'line-color': '#ed6c00',
          'line-width': 1,
        },
      })
      map.addLayer({
        id: 'points',
        source: 'points',
        type: 'circle',
        paint: {
          'circle-color': '#fff',
          'circle-stroke-color': '#ed6c00',
          'circle-stroke-width': 1,
          'circle-radius': 3,
        },
      })
    })
    resolve(map)
  })
}

onMounted(async () => {
  const shirase = await getShiraseData()
  map = await initMainMap(shirase)
  minimap = await initMiniMap(shirase)

  const animationDuration = 80000
  const cameraOffset = { x: 100, y: 35, z: 20000 }
  map.flyTo({ center: shirase.points.features[0].geometry.coordinates, zoom: 8, bearing: 220 })
  map.once('idle', () => {
    setTimeout(() => {
      anime(shirase.points, cameraOffset, animationDuration)
    }, 2000)
  })
})
</script>

<template>
  <div ref="mapElem" class="map"></div>
  <div ref="minimapElem" class="miniMap"></div>
  <div class="control">
    <div class="time">{{ datetime }}</div>
  </div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 100%;
}
.miniMap {
  width: 200px;
  height: 200px;
  position: absolute;
  bottom: 40px;
  right: 40px;
  background-color: #000;
  border: 3px solid #fff;
  border-radius: 5px;
}
.control {
  position: absolute;
  z-index: 10;
  top: 100px;
  left: 30px;
}
.time {
  background-color: '#0009';
  border-radius: 10px;
  font-size: 30px;
  color: #fff;
  padding: 5px 15px;
}
</style>
