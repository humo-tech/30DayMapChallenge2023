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
    this.radius = options.radius
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
    this.aColor = gl.getAttribLocation(this.program, 'a_color')
    this.uMatrix = gl.getUniformLocation(this.program, 'u_matrix')
    this.uTime = gl.getUniformLocation(this.program, 'u_time')
    this.uRadius = gl.getUniformLocation(this.program, 'u_radius')
    this.uXrange = gl.getUniformLocation(this.program, 'u_xrange')
    this.uYrange = gl.getUniformLocation(this.program, 'u_yrange')
    this.uZrange = gl.getUniformLocation(this.program, 'u_zrange')

    const { position, range } = this.createGeometry(
      this.density,
      this.radius / 10000000,
      mapboxgl.MercatorCoordinate.fromLngLat(this.center)
    )
    this.pointNumber = position.length
    this.range = range

    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW)
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
      gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 0, 0)

      gl.uniformMatrix4fv(this.uMatrix, false, matrix)
      gl.uniform1f(this.uTime, (Date.now() - this.startTime) / 1000)
      gl.uniform1f(this.uRadius, this.radius)
      gl.uniform2fv(this.uXrange, this.range.x)
      gl.uniform2fv(this.uYrange, this.range.y)
      gl.uniform2fv(this.uZrange, this.range.z)
      gl.drawArrays(gl.POINTS, 0, this.pointNumber / 3)
      if (this.update) this.map.triggerRepaint()
    }
  }

  createGeometry(COUNT, RADIUS, OFFSET) {
    const position = []
    const xRange = [1, -1]
    const yRange = [1, -1]
    const zRange = [1, -1]
    for (let i = 0; i < COUNT; ++i) {
      // 変数 i を元にラジアンを求める（経度方向のラジアン）
      const iRad = (i / COUNT) * Math.PI * 2.0
      // 求めたラジアンからサインとコサインを作る
      const x = Math.sin(iRad)
      const z = Math.cos(iRad)
      for (let j = 0; j < COUNT; ++j) {
        // 変数 j を元にラジアンを求める（緯度方向のラジアン）
        const jRad = (j / COUNT) * Math.PI
        const r = Math.sin(jRad)
        const y = Math.cos(jRad)
        if (z > 0) {
          // 計算結果を元に XYZ 座標を決める
          const _x = x * RADIUS * r + OFFSET.x
          const _y = y * RADIUS + OFFSET.y
          const _z = z * RADIUS * r + OFFSET.z
          if (_x < xRange[0]) xRange[0] = _x
          if (_x > xRange[1]) xRange[1] = _x
          if (_y < yRange[0]) yRange[0] = _y
          if (_y > yRange[1]) yRange[1] = _y
          if (_z < zRange[0]) zRange[0] = _z
          if (_z > zRange[1]) zRange[1] = _z
          position.push(_x, _y, _z)
        }
      }
    }
    return { position, range: { x: xRange, y: yRange, z: zRange } }
  }
}
