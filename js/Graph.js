Graph = function(values, color, name) {
  this.values = values || []
  this.color = color || 'red'
  this.name = name || ''
  this.visible = true
  this.alpha = 1
  this.maxValue = 0

  if (values) {
    this.maxValue = this.getMaxValue()
  }
}

Graph.prototype.constructor = Graph

Graph.OFFSET = 1 // line half-thickness

Graph.prototype.draw = function(ctx, start, end, offsetX, offsetY, scaleX, scaleY) {
  if (this.alpha < MIN_VISIBLE_ALPHA && !this.visible) {
    return
  }

  ctx.beginPath()
  ctx.fillStyle = this.color
  ctx.globalAlpha = this.alpha

  this.preparePoints(start, end, scaleX, scaleY)
  let pts = this.preparePoints(start, end, scaleX, scaleY)
  let ptsCount = pts.length

  ctx.moveTo(offsetX, offsetY - pts[0].y)
  for (let i = 1; i < ptsCount; i++) {
    let p = pts[i]
    ctx.lineTo(offsetX + p.x, offsetY - p.y)
  }

  ctx.fill()
  ctx.globalAlpha = 1
}

Graph.prototype.preparePoints = function(start, end, stepX, scaleY) {
  let xPos = stepX
  let p0 //null
  let p1 = {x: 0, y: this.values[start] * scaleY}
  let p2 = {x: xPos, y: this.values[start + 1] * scaleY}

  let prevNormal = Graph.getNormal(p2, p1, true)
  let prevInv = false

  let fw = [Graph.vecAdd(p1, prevNormal)]
  let bw = [Graph.vecSub(p1, prevNormal)]

  for (let i = start + 1; i < end; i++) {
    xPos += stepX
    p0 = p1
    p1 = p2
    p2 = {x: xPos, y: this.values[i + 1] * scaleY}

    let dir = Graph.getPtToVecDir(p0, p1, p2)
    if (!dir) {
      continue
    }

    let inv = dir < 0

    let n01 = prevNormal
    if (prevInv != inv) {
      Graph.vecInv(n01)
    }

    let n12 = Graph.getNormal(p1, p2, inv)
    prevNormal = n12
    prevInv = inv

    let pn010 = Graph.vecAdd(p0, n01)
    let pn011 = Graph.vecAdd(p1, n01)
    let pn120 = Graph.vecAdd(p1, n12)
    let pn121 = Graph.vecAdd(p2, n12)

    let pt = Graph.getIntersection(pn010, pn011, pn120, pn121)
    let opPt = Graph.vecSub(p1, Graph.vecSub(pt, p1))

    let a1 = inv ? fw : bw
    let a2 = inv ? bw : fw
    a1.push(opPt)
    if (Math.abs(pn011.y - pt.y) > Graph.OFFSET * 2.5) {
      a2.push(pn011, pn120)
    } else {
      a2.push(pt)
    }
  }

  if (prevInv) {
    Graph.vecInv(prevNormal)
  }
  fw.push(Graph.vecAdd(p2, prevNormal))
  bw.push(Graph.vecSub(p2, prevNormal))

  return fw.concat(bw.reverse())
}

Graph.getIntersection = function(l1p1, l1p2, l2p1, l2p2) {
  let l1x = l1p2.x - l1p1.x
  let l1y = l1p2.y - l1p1.y
  let l2x = l2p2.x - l2p1.x
  let l2y = l2p2.y - l2p1.y
  let a = l1p1.y - l2p1.y
  let b = l1p1.x - l2p1.x

  let denominator = l2y * l1x - l2x * l1y
  let numerator1 = l2x * a - l2y * b
  let t = numerator1 / denominator

  let x = l1p1.x + t * (l1p2.x - l1p1.x)
  let y = l1p1.y + t * (l1p2.y - l1p1.y)

  return {x, y}
}

Graph.getPtToVecDir = function(p0, p1, p) {
  // 0 - straight, < 0 - to left, > 0 - to right
  return (p.y - p0.y) * (p1.x - p0.x) - (p.x - p0.x) * (p1.y - p0.y)
}

Graph.getNormal = function(p0, p1, toLeft) {
  let nor = {
    x: p1.y - p0.y,
    y: p0.x - p1.x
  }
  let mult = Graph.OFFSET / Math.sqrt(nor.x * nor.x + nor.y * nor.y)
  if (toLeft) {
    mult = -mult
  }
  nor.x *= mult
  nor.y *= mult
  return nor
}

Graph.vecAdd = function(p0, p1) {
  return {
    x: p0.x + p1.x,
    y: p0.y + p1.y
  }
}

Graph.vecSub = function(p0, p1) {
  return {
    x: p0.x - p1.x,
    y: p0.y - p1.y
  }
}

Graph.vecInv = function(p) {
  p.x = -p.x
  p.y = -p.y
  return p
}

Graph.prototype.getMaxValue = function(start, end) {
  start = start || 0
  end = end || this.values.length - 1
  let max = 0
  for (let i = start; i <= end; i++) {
    const v = this.values[i]
    max = Math.max(max, v)
  }
  return max
}
