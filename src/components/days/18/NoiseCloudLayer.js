import { WebGLUtil } from './WebglUtil'
import maplibregl from 'maplibre-gl'
import vertexSource from './shaders/vertex.glsl?raw'
import fragmentSource from './shaders/fragment.glsl?raw'

export class NoiseCloudLayer {
  /**
   *
   * @param {String} id
   * @param {Array<Array<Number>>} bbox [[lng, lat](left_top), [lng, lat](right_top), [lng, lat](right_bottom), [lng, lat](left_bottom)]
   * @param {Object} options
   * @param {Object<Number>} options.oct
   * @param {Object<Number>} options.opacity
   * @param {Object<Number>} options.contrast
   * @param {Object<Boolean>} options.noUpdate
   * @param {Object} shaders
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
    this.oct = options?.oct || 8
    this.alt = options?.alt || 0
    this.opacity = options?.opacity ?? 0.7
    this.contrast = options?.contrast ?? 0.3
    this.update = !options?.noUpdate

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
    this.uOct = gl.getUniformLocation(this.program, 'u_oct')
    this.uMatrix = gl.getUniformLocation(this.program, 'u_matrix')
    this.uTime = gl.getUniformLocation(this.program, 'u_time')
    this.uAltMeter = gl.getUniformLocation(this.program, 'u_alt_meter')
    this.uOpacity = gl.getUniformLocation(this.program, 'u_opacity')
    this.uContrast = gl.getUniformLocation(this.program, 'u_contrast')

    gl.uniform1i(this.uOct, this.oct)
    gl.uniform1f(this.uAltMeter, this.alt)
    gl.uniform1f(this.uOpacity, this.opacity)
    gl.uniform1f(this.uContrast, this.contrast)

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
      if (this.update) this.map.triggerRepaint()
    }
  }
}
