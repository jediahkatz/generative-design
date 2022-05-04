// kandinsky
// jediah katz

/**
 * generates a composition in the style of kandinsky
 *
 * MOUSE
 * left click          : new composition
 *
 * KEYS
 * s                   : save png
 */
'use strict'

const colorCount = 20
const circleCount = 30
let hueValues = []
let saturationValues = []
let brightnessValues = []
let actRandomSeed = 0

function setup() {
  createCanvas(windowWidth, windowHeight)
  colorMode(HSB, 360, 100, 100, 100)
}

function draw() {
  noLoop()
  background(220, 22, 16)
  randomSeed(actRandomSeed)

  const ellipses = getEllipses()
  
  ellipses
  .forEach(({ x, y, w, h, color: c, hasGlow, hasStroke }) => {
    if (hasGlow) {
      // glow(color(161, 14, 87), w/2)
      glow(color(200, 28, 87), w/2)
    } else {
      glow(0, 0)
    }
    if (hasStroke) {
      stroke(220, 22, 16)
    } else {
      noStroke()
    }
    fill(c)
    ellipse(x, y, int(w*1.1), int(h*1.1))
  })
}

const glow = (glowColor, blurriness) => {
  drawingContext.shadowBlur = blurriness
  drawingContext.shadowColor = glowColor
}

// Returns a list of ellipses: {x, y, w, h, color, hasGlow, hasStroke}
const getEllipses = () => {
  hueValues = [317, 55, 204, 230, 354, 0]
  saturationValues = [23, 54, 47, 11, 67, 0]
  brightnessValues = [89, 95, 86, 87, 69, 0]

  const ellipses = []

  let radius = int(random(100, 175))
  let diameter = 2*radius
  let x = int(random(radius, windowWidth-radius))
  let y = int(random(radius, windowHeight-radius))
  ellipses.push({
    x, y,
    w: diameter, h: diameter,
    color: [231, 71 + 20, 70],
    hasGlow: true,
    hasStroke: false,
  })
  const radiusDiff = 40
  ellipses.push({
    // ngl i have no idea where the extra 4 comes from
    x: x - (radiusDiff+4)*cos(radians(45)),
    y: y - (radiusDiff+4)*sin(radians(45)),
    w: 2*(radius-radiusDiff), 
    h: 2*(radius-radiusDiff),
    color: [0, 0, 0],
    hasGlow: false,
    hasStroke: false,
  })

  let i = 0
  while (i < circleCount) {
    // prioritize smaller circles
    // reject circles w.p. (radius/80)
    radius = int(random(5, 80))
    if (random() <= radius/80) {
      continue
    }
    diameter = 2*radius
    x = int(random(radius, windowWidth-radius))
    y = int(random(radius, windowHeight-radius))
    const cIndex = i % hueValues.length
    const hasGlow = boolean(int(random(2)))
    const hasStroke = boolean(int(random(2)))
    let c = color(
      hueValues[cIndex], 
      saturationValues[cIndex] + 20, 
      brightnessValues[cIndex], 
      brightnessValues[cIndex] === 0 ? 100 : 80
    )
    ellipses.push({
      x, y, 
      w: diameter, h: diameter,
      color: c,
      hasGlow,
      hasStroke
    })

    i++
  }

  return ellipses
}

function mouseReleased() {
  actRandomSeed = random(100000)
  loop()
}

function keyPressed() {
  if (key == 's' || key == 'S') saveCanvas(gd.timestamp(), 'png')
}
