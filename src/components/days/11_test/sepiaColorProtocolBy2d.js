const redScale = 0.298912
const greenScale = 0.586611
const blueScale = 0.114478

const sRedScale = 1.07
const sGreenScale = 0.74
const sBlueScale = 0.43

const rgb2sepia = ([r, g, b, a]) => {
  if (a === 0) return [0, 0, 0, 0]

  // グレースケール化
  const grayColor = r * redScale + g * greenScale + b * blueScale
  // セピア調へ
  const monoColor = [grayColor * sRedScale, grayColor * sGreenScale, grayColor * sBlueScale, a]
  return monoColor
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
      const tRGB = rgb2sepia(imageData.data.slice(i * 4, (i + 1) * 4))
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
