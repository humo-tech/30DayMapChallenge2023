import { WebGLUtil } from './WebglUtil'

export const protocol = (params, callback) => {
  const image = new Image()

  image.crossOrigin = 'anonymous'
  image.addEventListener('load', () => {
    performance.mark('start')
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

    performance.mark('end')
    performance.measure(
      'performance', // 計測名
      'start', // 計測開始点
      'end' // 計測終了点
    )

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

    // https://wgld.org/d/webgl/w054.html
    const float redScale   = 0.298912;
    const float greenScale = 0.586611;
    const float blueScale  = 0.114478;
    const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);

    const float sRedScale   = 1.07;
    const float sGreenScale = 0.74;
    const float sBlueScale  = 0.43;
    const vec3  sepiaScale = vec3(sRedScale, sGreenScale, sBlueScale);

    void main() {
      vec4 samplerColor = texture2D(u_texture, v_texture_coord);
      // 元のアルファチを保存
      float alpha = samplerColor.a;
      // グレースケール化
      float grayColor = dot(samplerColor.rgb, monochromeScale);
      // セピア調へ
      vec3 monoColor = vec3(grayColor) * sepiaScale; 
      samplerColor = vec4(monoColor, alpha);
      gl_FragColor = samplerColor;
    }
`
