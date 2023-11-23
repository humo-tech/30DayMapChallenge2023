<script setup>
import { onMounted } from 'vue'
import {
  Ion,
  defined,
  Viewer,
  CesiumTerrainProvider,
  Terrain,
  SkyAtmosphere,
  Cesium3DTileset,
  Cesium3DTileStyle,
  CzmlDataSource,
  Cartesian3,
  Matrix4,
  Math as CesiumMath,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

import { CESIUM_ION_ACCESS_TOKEN } from '@/consts'

const baseUrl = import.meta.env.BASE_URL
// Grant CesiumJS access to your ion assets
Ion.defaultAccessToken = CESIUM_ION_ACCESS_TOKEN

let viewer
onMounted(async () => {
  viewer = new Viewer('map', {
    // terrain: await Terrain.fromWorldTerrain(),
  })

  try {
    const tileset = await Cesium3DTileset.fromIonAssetId(2363900)
    tileset.pointCloudShading.attenuation = true
    tileset.pointCloudShading.maximumAttenuation = 5.0
    // tileset.modelMatrix = Matrix4.fromTranslation(new Cartesian3(0, 0, 100))
    tileset.pointCloudShading.geometricErrorScale = 1.0
    viewer.scene.primitives.add(tileset)
    await viewer.zoomTo(tileset)
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div id="map" class="map"></div>
</template>

<style scoped>
.map {
  width: 100%;
  height: calc(100% - 80px);
  margin-top: 80px;
}
</style>
