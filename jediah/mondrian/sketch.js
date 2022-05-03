// mondrian
// jediah katz

/**
 * generates a composition in the style of mondrian
 *
 * MOUSE
 * left click          : new composition
 *
 * KEYS
 * s                   : save png
 */
'use strict'

const colorCount = 20
const lineCount = 20
let hueValues = []
let saturationValues = []
let brightnessValues = []
let actRandomSeed = 0

function setup() {
  createCanvas(windowWidth, windowHeight)
  colorMode(HSB, 360, 100, 100, 100)
  noStroke()
}

const getLines = () => {
  // [y, x0, x1]
  const hLines = [[0, 0, windowWidth], [windowHeight, 0, windowWidth]]
  // [x, y0, y1]
  const vLines = [[0, 0, windowHeight], [windowWidth, 0, windowHeight]]
  for (let i = 0; i < lineCount; i++) {
    // randomly pick between adding horizontal and vertical lines
    if (int(random(2)) === 0) {
      // horizontal: randomly generate a y-coordinate
      const yCoord = int(random(windowHeight))
      // discard y coordinates too close to previous ones
      if (hLines.find(([y]) => abs(y - yCoord) <= 20)) {
        continue
      }
      // for the x coordinates, randomly pick two distinct endpoints of
      // existing vertical lines that pass through this y coordinate
      const linesPassing = vLines.filter(l => doesLinePassThroughCoord(l, yCoord))
      const [x0] = linesPassing[int(random(linesPassing.length))]
      let [x1] = linesPassing[int(random(linesPassing.length))]
      if (x0 === x1) {
        continue
      }
      const [x0s, x1s] = [x0, x1].sort()
      hLines.push([yCoord, x0s, x1s])
      hLines.sort(([a], [b]) => a < b ? -1 : 1)
    } else {
      // vertical case is symmetrical
      const xCoord = int(random(windowWidth))
      if (vLines.find(([x]) => abs(x - xCoord) <= 20)) {
        continue
      }
      const linesPassing = hLines.filter(l => doesLinePassThroughCoord(l, xCoord))
      const [y0] = linesPassing[int(random(linesPassing.length))]
      const [y1] = linesPassing[int(random(linesPassing.length))]
      if (y0 === y1) {
        continue
      }
      const [y0s, y1s] = [y0, y1].sort()
      vLines.push([xCoord, y0s, y1s])
      vLines.sort(([a], [b]) => a < b ? -1 : 1)
    }
  }
  return { hLines, vLines }
}

const doesLinePassThroughCoord = (line, point) => {
  const [_, c0, c1] = line
  return (c0 <= point) && (point <= c1)
}

const getRectsBoundedByLines = ({ hLines, vLines }) => {
  // for each hLine, get all vLines that intersect it,
  // except where the intersection is the endpoint of either line
  // rects look like [x, y, w, h]
  const rects = hLines.flatMap((hLine, hIndex) => {
    const [hy, hx0, hx1] = hLine
    return vLines.map((vLine, vIndex) => {
      const [vx, vy0, vy1] = vLine
      const intersectsAtTopLeftCorner = (
        doesLinePassThroughCoord([hy, hx0, hx1-1], vx) &&
        doesLinePassThroughCoord([vx, vy0, vy1-1], hy)
      )
      if (!intersectsAtTopLeftCorner) {
        return null
      }
      const nextHLine = hLines
      .slice(hIndex+1)
      .find(([hyNext, hx0Next, hx1Next]) => (
        doesLinePassThroughCoord([hyNext, hx0Next, hx1Next-1], vx))
      )
      
      const nextVLine = vLines
      .slice(vIndex+1)
      .find(([vxNext, vy0Next, vy1Next]) => (
        doesLinePassThroughCoord([vxNext, vy0Next, vy1Next-1], hy))
      )

      if (!nextHLine || !nextVLine) {
        return null
      }

      const [hyNext] = nextHLine
      const [vxNext] = nextVLine
      return [vx, hy, vxNext-vx, hyNext-hy]

    }).filter(x => x !== null)
  })
  return rects
}

function draw() {
  noLoop()
  background(0, 0, 100)
  randomSeed(actRandomSeed)

  // ------ colors ------
  hueValues = [7, 243, 56, 0]
  saturationValues = [83, 86, 67, 0]
  brightnessValues = [82, 95, 98, 100]

  // ------ area tiling ------
  const { hLines, vLines } = getLines()
  const boundedRects = getRectsBoundedByLines({ hLines, vLines })
  boundedRects.forEach(([x, y, w, h], i) => {
    let color = int(random(hueValues.length + 4))
    if (color >= hueValues.length) color = hueValues.length-1
    // const color = i % (hueValues.length - 1)
    fill(hueValues[color], saturationValues[color], brightnessValues[color])
    rect(x, y, w, h)
  })

  fill(0, 0, 0)
  hLines.forEach(([y, x0, x1]) => {
    rect(x0, y, x1-x0, 10)
  })
  vLines.forEach(([x, y0, y1]) => {
    rect(x, y0, 10, y1-y0)
  })
}

function mouseReleased() {
  actRandomSeed = random(100000)
  loop()
}

function keyPressed() {
  if (key == 's' || key == 'S') saveCanvas(gd.timestamp(), 'png')
}
