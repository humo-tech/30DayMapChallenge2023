import { WebGLUtil } from './WebglUtil'
import mapboxgl from 'mapbox-gl-3.0.0-rc.2'
import vertexSource from './shaders/vertex.glsl?raw'
import fragmentSource from './shaders/fragment.glsl?raw'

export class SphereLayer {
  /**
   *
   * @param {String} id
   * @param {Object} options
   * @param {Object<Array<Number>>} options.center
   * @param {Object<Number>} options.radius
   * @param {Object<Number>} options.density
   * @param {Object} shaders
   * @param {Object<String>} shaders.vertexSource
   * @param {Object<String>} shaders.fragmentSource
   */
  constructor(id, options, shaders) {
    this.id = id
    this.type = 'custom'
    this.renderingMode = '3d'
    if (shaders) {
      this.shaders = shaders
    } else {
      this.shaders = {
        vertexSource,
        fragmentSource,
      }
    }
    this.update = !options.noUpdate
    this.center = options.center
    this.radius = options.radius / 10000000
    this.density = options.density || 100
  }

  /**
   *
   * @param {Map} map
   * @param {WebGL2RenderingContext} gl
   */
  onAdd(map, gl) {
    this.map = map
    this.gl = gl
    this.startTime = Date.now() - Math.random() * 1000
    // this.startTime = Date.now()

    this.program = WebGLUtil.createProgram(this.gl, this.shaders.vertexSource, this.shaders.fragmentSource)

    this.aPos = gl.getAttribLocation(this.program, 'a_pos')
    this.uOffset = gl.getUniformLocation(this.program, 'u_offset')
    this.uMatrix = gl.getUniformLocation(this.program, 'u_matrix')
    this.uTime = gl.getUniformLocation(this.program, 'u_time')
    this.uRadius = gl.getUniformLocation(this.program, 'u_radius')

    // this.sphereGeometory = this.createGeometry(this.density, this.density, this.radius / 10000000, [1.0, 1.0, 1.0, 1.0])
    this.sphereGeometory = this.createGeometry(this.density, this.density, this.radius, [1.0, 1.0, 1.0, 1.0])
    this.offset = mapboxgl.MercatorCoordinate.fromLngLat(this.center)
    console.log(this.offset)
    console.log(this.sphereGeometory.position)

    this.vbo = WebGLUtil.createVBO(gl, this.sphereGeometory.position)
    this.ibo = WebGLUtil.createIBO(gl, this.sphereGeometory.index)
  }

  /**
   *
   * @param {WebGL2RenderingContext} gl
   * @param {Array} matrix
   */
  render(gl, matrix) {
    if (this.program) {
      gl.useProgram(this.program)

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)
      gl.enableVertexAttribArray(this.aPos)
      gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo)

      gl.uniform3fv(this.uOffset, [this.offset.x, this.offset.y, this.offset.z])
      gl.uniformMatrix4fv(this.uMatrix, false, matrix)
      gl.uniform1f(this.uTime, (Date.now() - this.startTime) / 1000)
      gl.uniform1f(this.uRadius, this.radius)
      gl.drawElements(gl.TRIANGLES, this.sphereGeometory.index.length, gl.UNSIGNED_SHORT, 0)

      if (this.update) this.map.triggerRepaint()
    }
  }

  createGeometry(row, column, rad, rgba) {
    const position = []
    const normal = []
    const color = []
    const texCoord = []
    const index = []

    console.log(row, column, rad, rgba)
    for (let i = 0; i <= row; i++) {
      const r = (Math.PI / row) * i
      const ry = Math.cos(r)
      const rr = Math.sin(r)
      for (let j = 0; j <= column; j++) {
        const tr = ((Math.PI * 2) / column) * j
        const tx = rr * rad * Math.cos(tr)
        const ty = ry * rad
        const tz = Math.max(rr * rad * Math.sin(tr), -0.27 * rad) + 0.27 * rad
        const rx = rr * Math.cos(tr)
        const rz = rr * Math.sin(tr)
        position.push(tx, ty, tz)
        normal.push(rx, ry, rz)
        color.push(...rgba)
        texCoord.push(1 - (1 / column) * j, (1 / row) * i)
      }
    }
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < column; j++) {
        const r = (column + 1) * i + j
        index.push(r, r + 1, r + column + 2)
        index.push(r, r + column + 2, r + column + 1)
      }
    }
    return { position, normal, color, texCoord, index }
  }
}
