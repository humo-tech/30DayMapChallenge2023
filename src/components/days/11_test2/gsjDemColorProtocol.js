import { WebGLUtil } from './WebglUtil'

export default (params, callback) => {
  const image = new Image()

  image.crossOrigin = 'anonymous'
  image.addEventListener('load', () => {
    const { gl, program } = getProgram(image.width, image.height)
    const uTexture = gl.getUniformLocation(program, 'u_texture')
    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.uniform1i(uTexture, 0)

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)

    // if (params.url.match(/\/0\/0\/0/)) console.log(gl.canvas.toDataURL())

    gl.canvas.toBlob(
      (blob) => blob.arrayBuffer().then((arr) => callback(null, arr, null, null))
      // ここで返すデータは、画像のArrayBuffer()でなければならない
      // https://qiita.com/Kanahiro/items/1e9c1a4ad6be76b27f0f
    )
  })
  const url = new URL(params.url)
  const protocol = url.protocol
  image.src = params.url.replace(`${protocol}//`, '')
  return { cancel: (_) => {} }
}

/**
 * 共通して使用するContextおよびプログラムを生成する関数
 * 全てで共通するAttributes の設定もここで行う
 * こうしないと、ZoomIn/Out 時に大量にWebGLContextが生成され、WebGLContextLost が発生してしまう
 * @param {Number} width
 * @param {Number} height
 * @returns
 */
const getProgram = (width, height) => {
  if (getProgram.cache) return getProgram.cache

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const gl = canvas.getContext('webgl')
  gl.clearColor(1.0, 1.0, 1.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.viewport(0, 0, width, height)

  const program = WebGLUtil.createProgram(gl, vertexShader, fragmentShader)
  const aPos = gl.getAttribLocation(program, 'a_pos')
  const aTextureCoord = gl.getAttribLocation(program, 'a_texture_coord')

  // VBO aPos
  const positionVBO = WebGLUtil.createVBO(gl, [-1.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0])
  gl.bindBuffer(gl.ARRAY_BUFFER, positionVBO)
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0)

  // VBO aTextureCoord
  const textureCoordVBO = WebGLUtil.createVBO(gl, [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0])
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordVBO)
  gl.enableVertexAttribArray(aTextureCoord)
  gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, 0, 0)

  // IBO
  const IBO = WebGLUtil.createIBO(gl, [0, 1, 2, 3, 2, 1])
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO)

  // save to cache
  getProgram.cache = {
    gl,
    program,
  }

  return getProgram.cache
}

const vertexShader = /* glsl */ `
    attribute vec3 a_pos;
    attribute vec2 a_texture_coord;
    varying vec2 v_texture_coord;
    void main() {
        v_texture_coord = a_texture_coord;
        gl_Position = vec4(a_pos, 1.0);
    }
`
const fragmentShader = /* glsl */ `
    precision mediump float;

    uniform sampler2D u_texture;
    varying vec2 v_texture_coord;

    const float rScale = 65536.0;
    const float gScale = 256.0;
    const float bScale = 1.0;
    const vec3  elevationScale = vec3(rScale, gScale, bScale);

    void main() {
      vec4 samplerColor = texture2D(u_texture, v_texture_coord);
      samplerColor *= 255.0;
      if(samplerColor.r >= 128.0) {
        samplerColor.r -= 256.0;
      }
      // GSJ format elevation
      float elevation = dot(samplerColor.rgb , elevationScale) * 0.01;
      // mapbox/maplibre format elevation
      vec3 rgb = vec3(0.0);
      if (elevation < 0.0) {
        float sea_elevation = min(0.0, elevation) * -1.0;
        float b = mix(0.5, 0.0, sea_elevation / 10000.0);
        rgb = vec3(0.0, 0.1, b);
      } else {
        float land_elevation = max(0.0, elevation);
        float base = mix(0.3, 1.0, pow(land_elevation / 8000.0, 0.3));
        rgb = vec3(104.0, 128.0, 84.0) * base / 255.0;
      }
      gl_FragColor = vec4(rgb, 1.0);
    }
`
