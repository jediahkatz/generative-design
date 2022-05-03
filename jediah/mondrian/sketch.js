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
  for (let i=0; i<4; i++) {
    // randomly pick between adding horizontal and vertical lines
    if (int(random(2)) === 0) {
      // horizontal: randomly generate a y-coordinate
      const yCoord = int(random(windowHeight))
      // discard y coordinates too close to previous ones
      if (hLines.find(([y,]) => abs(y - yCoord) <= 20)) {
        continue
      }
      // for the x coordinates, randomly pick two distinct endpoints of
      // existing vertical lines that pass through this y coordinate
      const linesPassing = vLines.filter(l => doesLinePassThroughCoord(l, yCoord))
      const [x0,] = linesPassing[int(random(linesPassing.length))]
      let [x1,] = linesPassing[int(random(linesPassing.length))]
      if (x0 === x1) {
        continue
      }
      const [x0s, x1s] = [x0, x1].sort()
      hLines.push([yCoord, x0s, x1s])
      hLines.sort()
    } else {
      // vertical case is symmetrical
      const xCoord = int(random(windowWidth))
      if (vLines.find(([x,]) => abs(x - xCoord) <= 20)) {
        continue
      }
      const linesPassing = hLines.filter(l => doesLinePassThroughCoord(l, xCoord))
      const [y0,] = linesPassing[int(random(linesPassing.length))]
      const [y1,] = linesPassing[int(random(linesPassing.length))]
      if (y0 === y1) {
        continue
      }
      const [y0s, y1s] = [y0, y1].sort()
      vLines.push([xCoord, y0s, y1s])
      vLines.sort()
    }
  }
  return { hLines, vLines }
}

const doesLinePassThroughCoord = (line, point) => {
  const [_, c0, c1] = line
  return (c0 <= point) && (point <= c1)
}

const getRectTopLeftCorners = ({ hLines, vLines }) => {
  // for each hLine, get all vLines that intersect it,
  // except where the intersection is the endpoint of either line
  const topLeftCorners = hLines.flatMap(hLine => {
    const [hy, hx0, hx1] = hLine
    return vLines.filter(vLine => {
      const [vx, vy0, vy1] = vLine
      const intersectsAtTopLeftCorner = (
        doesLinePassThroughCoord([hy, hx0, hx1-1], vx) &&
        doesLinePassThroughCoord([vx, vy0, vy1-1], hy)
        )
        console.log(vx, hy, intersectsAtTopLeftCorner)
      return intersectsAtTopLeftCorner
    }).map(([vx,]) => [vx, hy])
  })
  return topLeftCorners
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
  const topLeftCorners = getRectTopLeftCorners({ hLines, vLines })
  topLeftCorners.forEach(([x, y], i) => {
    // const color = random(hueValues.length)
    const color = i % hueValues.length
    fill(hueValues[color], saturationValues[color], brightnessValues[color])
    // const hue = i * int(360 / topLeftCorners.length)
    // fill(hue, 100, 100)
    rect(x, y, windowWidth-x, windowHeight-y)
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
