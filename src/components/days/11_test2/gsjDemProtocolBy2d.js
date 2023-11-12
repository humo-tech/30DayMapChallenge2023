const gsidem2terrainrgb = ([r, g, b, a]) => {
  let height = r * 655.36 + g * 2.56 + b * 0.01
  if (r === 128 && g === 0 && b === 0) {
    height = 0
  } else if (r >= 128) {
    height -= 167772.16
  }
  height += 100000
  height *= 10
  const tB = (height / 256 - Math.floor(height / 256)) * 256
  const tG = (Math.floor(height / 256) / 256 - Math.floor(Math.floor(height / 256) / 256)) * 256
  const tR =
    (Math.floor(Math.floor(height / 256) / 256) / 256 - Math.floor(Math.floor(Math.floor(height / 256) / 256) / 256)) *
    256
  return [tR, tG, tB]
}

export default (params, callback) => {
  const image = new Image()

  image.crossOrigin = 'anonymous'
  image.addEventListener('load', () => {
    performance.mark('start')
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height

    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < imageData.data.length / 4; i++) {
      const tRGB = gsidem2terrainrgb(imageData.data.slice(i * 4, (i + 1) * 4))
      imageData.data[i * 4] = tRGB[0]
      imageData.data[i * 4 + 1] = tRGB[1]
      imageData.data[i * 4 + 2] = tRGB[2]
    }
    context.putImageData(imageData, 0, 0)

    performance.mark('end')
    performance.measure(
      'performance', // 計測名
      'start', // 計測開始点
      'end' // 計測終了点
    )

    // if (params.url.match(/\/0\/0\/0/)) console.log(canvas.toDataURL())

    canvas.toBlob(
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
