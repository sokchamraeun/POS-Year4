export default function getCroppedImg(imageSrc, croppedAreaPixels, { zoom = 1, outputWidth, outputHeight } = {}) {
  return new Promise((resolve) => {
    const image = new Image()
    image.src = imageSrc

    image.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      const sourceX = croppedAreaPixels.x * scaleX
      const sourceY = croppedAreaPixels.y * scaleY
      const sourceWidth = croppedAreaPixels.width * scaleX
      const sourceHeight = croppedAreaPixels.height * scaleY

      const zoomedWidth = sourceWidth / zoom
      const zoomedHeight = sourceHeight / zoom
      const zoomedX = sourceX + (sourceWidth - zoomedWidth) / 2
      const zoomedY = sourceY + (sourceHeight - zoomedHeight) / 2

      canvas.width = outputWidth || croppedAreaPixels.width
      canvas.height = outputHeight || croppedAreaPixels.height

      ctx.drawImage(
        image,
        zoomedX,
        zoomedY,
        zoomedWidth,
        zoomedHeight,
        0,
        0,
        canvas.width,
        canvas.height
      )

      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95)
    }
  })
}
