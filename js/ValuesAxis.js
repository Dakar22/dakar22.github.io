ValuesAxis = function(scope) {
  this.scope = scope

  this.prevSet = {
    step: 1,
    alpha: 1,
    vals: [1, 2, 3, 4, 5]
  }

  this.newSet

  this.currentZoom = 1 //todo: better to move to GraphView

  this.startAnimTime
  this.startAnimStep
  this.targetStep
}

ValuesAxis.prototype.constructor = ValuesAxis


ValuesAxis.prototype.draw = function() {
   this.scope.graphView.ctxGraph.font = FONT
   this.scope.graphView.ctxGraph.fillStyle = TEXT_COLOR
   this.scope.graphView.ctxGraph.lineWidth = 0.25 / pixelRatio
   this.scope.graphView.ctxGraph.strokeStyle = TEXT_COLOR
   this.scope.graphView.ctxGraph.textAlign = 'left'

  let pixStep

  if (this.prevSet && this.prevSet.alpha > MIN_VISIBLE_ALPHA) {
    pixStep = VERT_PIX_STEP / (this.currentZoom / this.prevSet.step)
    this.drawVals(this.prevSet.vals, this.prevSet.alpha, pixStep)
  }

  if (this.newSet && this.newSet.alpha > MIN_VISIBLE_ALPHA) {
    pixStep = VERT_PIX_STEP / (this.currentZoom / this.newSet.step)
    this.drawVals(this.newSet.vals, this.newSet.alpha, pixStep)
  }
}

ValuesAxis.prototype.drawVals = function(vals, alpha, pixelStep) {
   this.scope.graphView.ctxGraph.beginPath()
   this.scope.graphView.ctxGraph.globalAlpha = alpha

  let yPos = GRAPH_HEIGHT

  for (let i = 0; i<= 5; i++) {
    if (i) {
      this.scope.graphView.ctxGraph.fillText(vals[i - 1], 4, (yPos | 0) - 8)
    }
    this.scope.graphView.ctxGraph.moveTo(0, yPos)
    this.scope.graphView.ctxGraph.lineTo(windowWidth, yPos)
    yPos -= pixelStep
    if (yPos < 0) {
      break
    }
  }

   this.scope.graphView.ctxGraph.stroke()
   this.scope.graphView.ctxGraph.globalAlpha = 1
}

ValuesAxis.prototype.updateParams = function() {
  let vertStep = 2 * Math.round( 0.5 * this.scope.graphView.intervalMaxVal / (VERT_STEPS_COUNT + 0.25))

  if (this.targetStep != vertStep) {
    //new target replaces less visible set
    if (this.newSet && this.prevSet.alpha < this.newSet.alpha) {
      this.prevSet = this.newSet
    }

    this.newSet = {
      step: vertStep,
      alpha: 0,
      vals: this.getValuesStr(vertStep)
    }

    this.startAnimTime = 0
    this.startAnimStep = this.currentZoom
    this.targetStep = vertStep
  }
}

ValuesAxis.prototype.getValuesStr = function(mult) {
  let array = []
  for (let i = 1; i <= VERT_STEPS_COUNT; i++) {
    let s = i * mult
    if (s >= 10000) {
      s = Math.ceil(s / 1000) + 'K'
    }
    array.push(s)
  }
  return array
}

ValuesAxis.prototype.animate = function(frameTime) {
  let needAnim = false

  if (this.newSet.step != this.currentZoom) {
    this.startAnimTime += frameTime
    const frac = Math.min(this.startAnimTime / 350, 1)

    this.prevSet.alpha = Math.min(this.prevSet.alpha, 1 - frac)
    this.newSet.alpha = frac

    this.currentZoom = this.startAnimStep + frac * (this.newSet.step - this.startAnimStep)

    this.scope.graphView.scaleY = GRAPH_HEIGHT / (this.scope.valuesAxis.currentZoom * (VERT_STEPS_COUNT + 0.5))

    needAnim = true
  }

  return needAnim
}
