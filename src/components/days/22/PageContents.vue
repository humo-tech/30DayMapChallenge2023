<script setup>
import { ref } from 'vue'
import Map from './Map.vue'
const position = ref({
  center: {
    lat: 35.689,
    lng: 139.692,
  },
  zoom: 1,
  uid: null,
})
</script>

<template>
  <div class="maps">
    <Map v-model:position="position" projection="mercator" :interactive="true" class="main"></Map>
    <Map v-model:position="position" projection="globe"></Map>
    <Map v-model:position="position" projection="equalEarth"></Map>
    <Map v-model:position="position" projection="naturalEarth"></Map>
    <Map v-model:position="position" projection="winkelTripel"></Map>
    <Map v-model:position="position" projection="albers"></Map>
    <Map v-model:position="position" projection="lambertConformalConic"></Map>
    <Map v-model:position="position" projection="equirectangular"></Map>
  </div>
</template>

<style scoped>
.maps {
  display: flex;
  flex-wrap: wrap;
  height: calc(100% - 80px);
  margin-top: 80px;
  justify-content: center;
}
.maps > * {
  width: 33%;
  height: 33%;
  border: 3px solid #000;
  box-sizing: border-box;
  border-radius: 10px;
}
.maps > .main {
  border-color: #f00;
}
</style>
