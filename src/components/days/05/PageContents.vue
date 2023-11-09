<script setup>
import { ref, onMounted } from 'vue'
import { Scene, PerspectiveCamera, WebGLRenderer, Group, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
const baseUrl = import.meta.env.BASE_URL

const canvasElem = ref(null)
let scene
let camera
let renderer
let controls
let group

const init = () => {
  scene = new Scene()
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50)
  renderer = new WebGLRenderer()
  renderer.setClearColor(0x000015)
  canvasElem.value.appendChild(renderer.domElement)
  resize()

  group = new Group()
  scene.add(group)

  const params = new URLSearchParams(location.search)
  const gltfConfig = {
    old: {
      file: '3Ddata.glb',
      positionY: -0.55,
      rotationY: 2.7,
      cameraZ: 0.6,
    },
    new: {
      file: '3Ddata2.glb',
      positionY: -0.38,
      rotationY: 0,
      cameraZ: 0.35,
    },
  }
  const gltfMode = params.get('mode') === 'new' ? 'old' : 'new'
  const loader = new GLTFLoader()
  loader.load(`${baseUrl}/days/05/${gltfConfig[gltfMode].file}`, (gltf) => {
    group.position.y = gltfConfig[gltfMode].positionY
    group.rotation.y = gltfConfig[gltfMode].rotationY
    group.add(gltf.scene)
  })
  controls = new OrbitControls(camera, renderer.domElement)
  controls.autoRotate = true
  controls.autoRotateSpeed = 2.0
  camera.position.set(0, 0.2, gltfConfig[gltfMode].cameraZ)
  camera.lookAt(new Vector3(0, 0, 0))
  controls.update()
}
const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

const resize = () => {
  const width = window.innerWidth
  const height = window.innerHeight

  // レンダラーのサイズを調整する
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)

  // カメラのアスペクト比を正す
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}
onMounted(async () => {
  init()
  animate()
  window.addEventListener('resize', resize)
})
</script>

<template>
  <div ref="canvasElem" class="canvas"></div>
  <a href="https://www.widar.io/" target="_blank"
    ><span>3D model created by</span><img src="https://viewer.widar.io/widar_logo_v4.png" alt="widar logo"
  /></a>
</template>

<style scoped>
.canvas {
  width: 100%;
  height: 100%;
}
a {
  position: absolute;
  z-index: 2;
  bottom: 10px;
  right: 10px;
  color: #fff;
}
img {
  width: 100px;
  vertical-align: baseline;
  margin-bottom: -10px;
}
</style>
