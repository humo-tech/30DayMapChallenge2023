export class WebGLUtil {
  /**
   * @param {WebGL2RenderingContext} gl
   */
  static createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = this.createShader(gl, vertexSource, gl.VERTEX_SHADER)
    const fragmentShader = this.createShader(gl, fragmentSource, gl.FRAGMENT_SHADER)

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.useProgram(program)
      return program
    } else {
      throw new Error(gl.getProgramInfoLog(program))
    }
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {String} source
   * @param {String} shaderType
   */
  static createShader(gl, source, shaderType) {
    const shader = gl.createShader(shaderType)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader
    } else {
      throw new Error(gl.getShaderInfoLog(shader))
    }
  }

  /**
   * create VBO
   * @param {WebGL2RenderingContext} gl
   * @param {Array<Number>} data
   */
  static createVBO = (gl, data) => {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    return buffer
  }

  /**
   * create IBO
   * @param {WebGL2RenderingContext} gl
   * @param {Array<Number>} data
   */
  static createIBO = (gl, data) => {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

    return buffer
  }
}
