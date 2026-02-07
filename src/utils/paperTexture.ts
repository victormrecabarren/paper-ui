import * as THREE from 'three'

// Higher resolution reduces visible pixel-grid when camera is close.
const SIZE = 512

/**
 * Construction-paper style texture: subtle grain and color variation.
 */
export function createPaperTexture(
  color: string = '#f5f0e8',
  grainStrength: number = 0.06
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, SIZE, SIZE)
  const imageData = ctx.getImageData(0, 0, SIZE, SIZE)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * grainStrength * 255
    data[i] = Math.max(0, Math.min(255, data[i] + n))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n))
  }
  ctx.putImageData(imageData, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  // Improve downsampling/angle sampling so the grain doesn't look blocky.
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
