import { WebGLUtil } from './WebglUtil'
import maplibregl from 'maplibre-gl'
import vertexSource from './shaders/vertex.glsl?raw'
import fragmentSource from './shaders/fragment.glsl?raw'

export class MagicCircleLayer {
  /**
   *
   * @param {String} id
   * @param {Array} bbox
   * @param {Array<Array<Number>>} bbox.coordinate
   * @param {Object} shaders
   * @param {Object} options
   * @param {Object<Number>} options.splitNumber
   * @param {Object<Array>} options.colorBalance
   * @param {Object<String>} shaders.vertexSource
   * @param {Object<String>} shaders.fragmentSource
   */
  constructor(id, bbox, options, shaders) {
    this.id = id
    this.type = 'custom'
    if (shaders) {
      this.shaders = shaders
    } else {
      this.shaders = {
        vertexSource,
        fragmentSource,
      }
    }
    this.colorBalance = options?.colorBalance || [0.9, 0.5, 0.8]
    this.rotationBalance = options?.rotationBalance || [1.5, 3.0, 1.0]
    this.splitNumber = options?.splitNumber || 8

    this.positions = bbox.map((coord) => maplibregl.MercatorCoordinate.fromLngLat(coord))
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
    this.uRangeMin = gl.getUniformLocation(this.program, 'u_range_min')
    this.uRangeMax = gl.getUniformLocation(this.program, 'u_range_max')
    this.uColorBalance = gl.getUniformLocation(this.program, 'u_color_balance')
    this.uSplitNumber = gl.getUniformLocation(this.program, 'u_split_number')
    this.uMatrix = gl.getUniformLocation(this.program, 'u_matrix')
    this.uTime = gl.getUniformLocation(this.program, 'u_time')

    gl.uniform2fv(this.uRangeMin, [this.positions[2].x, this.positions[0].y])
    gl.uniform2fv(this.uRangeMax, [this.positions[0].x, this.positions[2].y])
    gl.uniform3fv(this.uColorBalance, this.colorBalance)
    gl.uniform3fv(this.uRatationBalance, this.rotationBalance)
    gl.uniform1i(this.uSplitNumber, this.splitNumber)

    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    /* 3 0
       2 1 */
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // 1st triangle
        this.positions[0].x,
        this.positions[0].y,
        this.positions[2].x,
        this.positions[2].y,
        this.positions[1].x,
        this.positions[1].y,
        // 2nd triangle
        this.positions[0].x,
        this.positions[0].y,
        this.positions[3].x,
        this.positions[3].y,
        this.positions[2].x,
        this.positions[2].y,
      ]),
      gl.STATIC_DRAW
    )
  }

  /**
   *
   * @param {WebGL2RenderingContext} gl
   * @param {Array} matrix
   */
  render(gl, matrix) {
    if (this.program) {
      gl.useProgram(this.program)

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
      gl.enableVertexAttribArray(this.aPos)
      gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0)

      gl.uniformMatrix4fv(this.uMatrix, false, matrix)
      gl.uniform1f(this.uTime, (Date.now() - this.startTime) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      this.map.triggerRepaint()
    }
  }
}
