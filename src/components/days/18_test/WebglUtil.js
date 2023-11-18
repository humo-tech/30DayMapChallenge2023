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
}
