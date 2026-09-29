import * as THREE from 'three'

type TextureSet = {
  color: THREE.CanvasTexture
  normal: THREE.CanvasTexture
  roughness: THREE.CanvasTexture
}

function seededRandom(seed: number) {
  let value = seed >>> 0

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function makeCanvasTexture(
    draw: (
        ctx: CanvasRenderingContext2D,
        size: number,
    ) => void,
    size = 512,
    colorSpace: THREE.ColorSpace = THREE.SRGBColorSpace,
) {
  const canvas = document.createElement('canvas')

  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error(
        'Unable to create procedural texture canvas.',
    )
  }

  draw(ctx, size)

  const texture = new THREE.CanvasTexture(canvas)

  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  texture.colorSpace = colorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true

  return texture
}

function makeDataTexture(
    draw: (
        ctx: CanvasRenderingContext2D,
        size: number,
    ) => void,
) {
  return makeCanvasTexture(
      draw,
      512,
      THREE.NoColorSpace,
  )
}

export function sidingTexture(
    color: string,
    mode:
        | 'vinyl'
        | 'fiberCement'
        | 'metal'
        | 'stucco'
        | 'brick',
): TextureSet {
  const random = seededRandom(
      7001 + mode.length * 17,
  )

  const colorMap = makeCanvasTexture(
      (ctx, size) => {
        ctx.fillStyle = color
        ctx.fillRect(0, 0, size, size)

        if (mode === 'metal') {
          for (
              let x = 0;
              x < size;
              x += 30
          ) {
            ctx.fillStyle =
                'rgba(255,255,255,.07)'
            ctx.fillRect(
                x,
                0,
                1.6,
                size,
            )

            ctx.fillStyle =
                'rgba(0,0,0,.10)'
            ctx.fillRect(
                x + 12,
                0,
                1.2,
                size,
            )
          }

          for (let i = 0; i < 1100; i++) {
            const g =
                100 +
                Math.floor(random() * 70)

            ctx.fillStyle = `rgba(${g},${g},${g},${.012 + random() * .025})`

            ctx.fillRect(
                random() * size,
                random() * size,
                1,
                1,
            )
          }

          return
        }

        if (mode === 'stucco') {
          for (let i = 0; i < 8500; i++) {
            const g =
                random() > 0.5
                    ? 255
                    : 0

            ctx.fillStyle = `rgba(${g},${g},${g},${.018 + random() * .025})`

            const r =
                0.4 +
                random() * 1.7

            ctx.fillRect(
                random() * size,
                random() * size,
                r,
                r,
            )
          }

          return
        }

        if (mode === 'brick') {
          const bw = 66
          const bh = 28

          for (
              let row = 0;
              row <
              Math.ceil(size / bh) + 1;
              row++
          ) {
            const y = row * bh
            const offset =
                row % 2
                    ? bw / 2
                    : 0

            for (
                let x = -bw + offset;
                x < size + bw;
                x += bw
            ) {
              const base =
                  random() > 0.35
                      ? color
                      : '#b06b51'

              ctx.fillStyle = base

              ctx.fillRect(
                  x + 2,
                  y + 2,
                  bw - 4,
                  bh - 4,
              )

              ctx.fillStyle =
                  'rgba(255,255,255,.09)'

              ctx.fillRect(
                  x + 4,
                  y + 4,
                  bw - 9,
                  2,
              )

              ctx.fillStyle =
                  'rgba(0,0,0,.18)'

              ctx.fillRect(
                  x + 3,
                  y + bh - 5,
                  bw - 6,
                  3,
              )
            }
          }

          ctx.fillStyle =
              'rgba(225,220,207,.95)'

          for (
              let y = 0;
              y < size;
              y += bh
          ) {
            ctx.fillRect(
                0,
                y,
                size,
                3,
            )
          }

          for (
              let row = 0;
              row < Math.ceil(size / bh);
              row++
          ) {
            const offset =
                row % 2
                    ? bw / 2
                    : 0

            for (
                let x = offset;
                x < size;
                x += bw
            ) {
              ctx.fillRect(
                  x,
                  row * bh,
                  3,
                  bh,
              )
            }
          }

          return
        }

        const board =
            mode === 'fiberCement'
                ? 20
                : 17

        for (
            let y = 0;
            y < size;
            y += board
        ) {
          ctx.fillStyle =
              'rgba(255,255,255,.055)'

          ctx.fillRect(
              0,
              y,
              size,
              1.2,
          )

          ctx.fillStyle =
              'rgba(0,0,0,.11)'

          ctx.fillRect(
              0,
              y + board - 1.4,
              size,
              1.4,
          )

          for (
              let x = 0;
              x < size;
              x += 42
          ) {
            ctx.fillStyle =
                'rgba(0,0,0,.025)'

            ctx.fillRect(
                x + random() * 10,
                y + 3,
                1,
                board - 6,
            )
          }
        }

        if (mode === 'fiberCement') {
          for (let i = 0; i < 1600; i++) {
            ctx.fillStyle = `rgba(255,255,255,${.01 + random() * .035})`

            ctx.fillRect(
                random() * size,
                random() * size,
                1 + random() * 9,
                0.7,
            )
          }
        }
      },
  )

  const normal = makeDataTexture(
      (ctx, size) => {
        ctx.fillStyle = '#8080ff'
        ctx.fillRect(
            0,
            0,
            size,
            size,
        )

        if (mode === 'metal') {
          for (
              let x = 0;
              x < size;
              x += 30
          ) {
            ctx.fillStyle = '#8d8dff'

            ctx.fillRect(
                x,
                0,
                2,
                size,
            )
          }
        } else if (mode === 'brick') {
          for (
              let y = 0;
              y < size;
              y += 28
          ) {
            ctx.fillStyle = '#6f6fff'

            ctx.fillRect(
                0,
                y + 24,
                size,
                2,
            )
          }

          for (
              let x = 0;
              x < size;
              x += 66
          ) {
            ctx.fillStyle = '#7777ff'

            ctx.fillRect(
                x,
                0,
                2,
                size,
            )
          }
        } else if (mode === 'stucco') {
          for (let i = 0; i < 5000; i++) {
            const g =
                118 +
                Math.floor(
                    random() * 22,
                )

            ctx.fillStyle = `rgb(${g},${g},255)`

            ctx.fillRect(
                random() * size,
                random() * size,
                1.2,
                1.2,
            )
          }
        } else {
          const board =
              mode === 'fiberCement'
                  ? 20
                  : 17

          for (
              let y = 0;
              y < size;
              y += board
          ) {
            ctx.fillStyle = '#7474ff'

            ctx.fillRect(
                0,
                y,
                size,
                1.3,
            )
          }
        }
      },
  )

  const roughness = makeDataTexture(
      (ctx, size) => {
        ctx.fillStyle =
            mode === 'metal'
                ? '#5c5c5c'
                : mode === 'stucco'
                    ? '#b0b0b0'
                    : mode === 'brick'
                        ? '#a0a0a0'
                        : '#909090'

        ctx.fillRect(
            0,
            0,
            size,
            size,
        )

        for (let i = 0; i < 1200; i++) {
          const g =
              120 +
              Math.floor(
                  random() * 70,
              )

          ctx.fillStyle = `rgb(${g},${g},${g})`

          ctx.fillRect(
              random() * size,
              random() * size,
              1 + random() * 3,
              1 + random() * 2,
          )
        }
      },
  )

  return {
    color: colorMap,
    normal,
    roughness,
  }
}

export function roofTexture(
    material:
        | 'architecturalShingle'
        | 'standingSeam'
        | 'concreteTile',
): TextureSet {
  const random = seededRandom(
      material === 'standingSeam'
          ? 3321
          : material === 'concreteTile'
              ? 4481
              : 9917,
  )

  const color = makeCanvasTexture(
      (ctx, size) => {
        ctx.fillStyle =
            material === 'standingSeam'
                ? '#343a3c'
                : material === 'concreteTile'
                    ? '#77726a'
                    : '#2f3233'

        ctx.fillRect(
            0,
            0,
            size,
            size,
        )

        if (
            material === 'standingSeam'
        ) {
          for (
              let x = 0;
              x < size;
              x += 44
          ) {
            ctx.fillStyle =
                'rgba(255,255,255,.10)'

            ctx.fillRect(
                x,
                0,
                1.8,
                size,
            )

            ctx.fillStyle =
                'rgba(0,0,0,.14)'

            ctx.fillRect(
                x + 3.5,
                0,
                1,
                size,
            )
          }
        } else if (
            material === 'concreteTile'
        ) {
          const w = 54
          const h = 34

          for (
              let y = 0;
              y < size + h;
              y += h
          ) {
            const offset =
                (Math.floor(y / h) % 2) *
                (w / 2)

            for (
                let x = -w;
                x < size + w;
                x += w
            ) {
              ctx.fillStyle =
                  random() > 0.25
                      ? '#77736b'
                      : '#858078'

              ctx.beginPath()

              ctx.roundRect(
                  x + offset + 2,
                  y + 2,
                  w - 4,
                  h - 4,
                  7,
              )

              ctx.fill()

              ctx.strokeStyle =
                  'rgba(0,0,0,.18)'

              ctx.stroke()
            }
          }
        } else {
          const rowHeight = 42

          for (
              let row = 0;
              row <
              size / rowHeight + 1;
              row++
          ) {
            const y =
                row * rowHeight

            const offset =
                row % 2 ? 21 : 0

            for (
                let x = -44 + offset;
                x < size + 44;
                x += 44
            ) {
              ctx.fillStyle =
                  row % 3 === 0
                      ? '#35393a'
                      : row % 3 === 1
                          ? '#303435'
                          : '#2b2f30'

              ctx.beginPath()

              ctx.moveTo(x, y)
              ctx.lineTo(
                  x + 44,
                  y,
              )
              ctx.lineTo(
                  x + 35,
                  y + 33,
              )
              ctx.lineTo(
                  x - 8,
                  y + 33,
              )

              ctx.closePath()
              ctx.fill()

              ctx.strokeStyle =
                  'rgba(255,255,255,.055)'

              ctx.stroke()
            }
          }
        }
      },
  )

  const normal = makeDataTexture(
      (ctx, size) => {
        ctx.fillStyle = '#8080ff'

        ctx.fillRect(
            0,
            0,
            size,
            size,
        )

        if (
            material === 'standingSeam'
        ) {
          for (
              let x = 0;
              x < size;
              x += 44
          ) {
            ctx.fillStyle = '#8585ff'

            ctx.fillRect(
                x,
                0,
                2,
                size,
            )
          }
        } else {
          for (
              let y = 0;
              y < size;
              y +=
                  material === 'concreteTile'
                      ? 34
                      : 42
          ) {
            ctx.fillStyle = '#7070ff'

            ctx.fillRect(
                0,
                y +
                (material ===
                'concreteTile'
                    ? 29
                    : 31),
                size,
                2,
            )
          }
        }
      },
  )

  const roughness = makeDataTexture(
      (ctx, size) => {
        ctx.fillStyle =
            material === 'standingSeam'
                ? '#606060'
                : '#9b9b9b'

        ctx.fillRect(
            0,
            0,
            size,
            size,
        )

        for (let i = 0; i < 1000; i++) {
          const g =
              135 +
              Math.floor(
                  random() * 55,
              )

          ctx.fillStyle = `rgb(${g},${g},${g})`

          ctx.fillRect(
              random() * size,
              random() * size,
              1 + random() * 3,
              1 + random() * 2,
          )
        }
      },
  )

  return {
    color,
    normal,
    roughness,
  }
}

export function concreteTexture(): TextureSet {
  const random = seededRandom(121212)

  const color = makeCanvasTexture(
      (ctx, size) => {
        ctx.fillStyle = '#9d9a92'

        ctx.fillRect(
            0,
            0,
            size,
            size,
        )

        for (let i = 0; i < 7000; i++) {
          const g =
              120 +
              Math.floor(
                  random() * 72,
              )

          ctx.fillStyle = `rgba(${g},${g},${g},${.02 + random() * .06})`

          const s =
              0.7 +
              random() * 2.8

          ctx.fillRect(
              random() * size,
              random() * size,
              s,
              s,
          )
        }
      },
  )

  const normal = makeDataTexture(
      (ctx, size) => {
        ctx.fillStyle = '#8080ff'

        ctx.fillRect(
            0,
            0,
            size,
            size,
        )

        for (let i = 0; i < 1600; i++) {
          const g =
              110 +
              Math.floor(
                  random() * 45,
              )

          ctx.fillStyle = `rgb(${g},${g},255)`

          ctx.fillRect(
              random() * size,
              random() * size,
              1 + random() * 3,
              1 + random() * 3,
          )
        }
      },
  )

  const roughness = makeDataTexture(
      (ctx, size) => {
        ctx.fillStyle = '#bbbbbb'

        ctx.fillRect(
            0,
            0,
            size,
            size,
        )

        for (let i = 0; i < 1100; i++) {
          const g =
              145 +
              Math.floor(
                  random() * 70,
              )

          ctx.fillStyle = `rgb(${g},${g},${g})`

          ctx.fillRect(
              random() * size,
              random() * size,
              2 + random() * 3,
              2 + random() * 3,
          )
        }
      },
  )

  return {
    color,
    normal,
    roughness,
  }
}