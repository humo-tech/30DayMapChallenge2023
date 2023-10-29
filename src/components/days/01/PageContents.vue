<script setup>
import { ref, onMounted } from 'vue'
import { WebGLUtility, ShaderProgram } from '@/scripts/webgl.js'
import vertexShaderSource from './shaders/vert.glsl?raw'
import fragmentShaderSource from './shaders/frag.glsl?raw'
const canvas = ref(null)

let gl = null
let shaderProgram = null
const vbo = []
let positions = []

const init = () => {
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight

  window.addEventListener('resize', resize)
}

const load = () => {
  gl = canvas.value.getContext('webgl')

  shaderProgram = new ShaderProgram(gl, {
    vertexShaderSource,
    fragmentShaderSource,
    attribute: ['position'],
    stride: [3],
  })
}

const setup = () => {
  setupGeometry()
  gl.clearColor(0.1, 0.1, 0.1, 1.0)
}

const setupGeometry = () => {
  // 場所決める
  positions = [-0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.0, 0.0, 0.0, -0.5, 0.5, 0.0, 0.5, 0.5, 0.0]
  vbo[0] = WebGLUtility.createVbo(gl, positions)
}

const render = () => {
  gl.viewport(0, 0, canvas.value.width, canvas.value.height)
  gl.clear(gl.COLOR_BUFFER_BIT)

  shaderProgram.use()
  shaderProgram.setAttribute(vbo)

  gl.drawArrays(gl.POINTS, 0, positions.length / 3)
}

const resize = () => {
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight

  render()
}

onMounted(() => {
  init()
  load()
  setup()
  render()
})
</script>

<template>
  <canvas ref="canvas" id="canvas"></canvas>
</template>
