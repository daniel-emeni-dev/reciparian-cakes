const TARGET_BYTES = 3 * 1024 * 1024
const MAX_DIMENSION = 2000
const QUALITY_STEPS = [0.85, 0.7, 0.55, 0.4]

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read the image'))
    }
    image.src = objectUrl
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not compress the image'))),
      'image/jpeg',
      quality
    )
  })
}

// Browser only. Keeps big phone photos under the host's request size limit;
// the upload route then does the real optimization with Sharp.
export async function compressImageForUpload(file: File): Promise<File | Blob> {
  if (file.size <= TARGET_BYTES) return file

  const image = await loadImage(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height))

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not supported')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  let blob = await canvasToBlob(canvas, QUALITY_STEPS[0])
  for (const quality of QUALITY_STEPS.slice(1)) {
    if (blob.size <= TARGET_BYTES) break
    blob = await canvasToBlob(canvas, quality)
  }
  return blob
}