const MAX_VISIBLE_DATES = 7 // can change according to window WT

DatesAxis = function(scope) {
  this.scope = scope

  this.datesStep = 1
  this.increateStep = true
  this.drawStep = 1
  this.startIndex1 = 0
  this.startIndex2 = 0
  this.startOffset1 = 0
  this.startOffset2 = 0
  this.alpha = 0
}

DatesAxis.prototype.constructor = DatesAxis

DatesAxis.prototype.draw = function() {
  this.scope.graphView.ctxGraph.font = FONT
  this.scope.graphView.ctxGraph.fillStyle = TEXT_COLOR
  this.scope.graphView.ctxGraph.textAlign = 'center'

  if (this.alpha > MIN_VISIBLE_ALPHA) {
    this.scope.graphView.ctxGraph.globalAlpha = this.alpha
    this.drawDates(this.startIndex1, this.startOffset1, this.drawStep)
  }

  this.scope.graphView.ctxGraph.globalAlpha = 1
  this.drawDates(this.startIndex2, this.startOffset2, this.drawStep)
}

DatesAxis.prototype.drawDates = function(startIndex, startOffset, step) {
  for (let i = startIndex; i <= this.scope.graphView.inclIntEnd; i += step) {
    const date = getDateStr(this.scope.times[i])
    this.scope.graphView.ctxGraph.fillText(date, startOffset | 0, GRAPH_HEIGHT + GRAPH_DATES_HEIGHT)
    startOffset += this.scope.graphView.scaleX * step
  }
}

DatesAxis.prototype.updateParams = function() {
  let step = 1
  let d2 =  this.scope.graphView.interval
  while (d2 > MAX_VISIBLE_DATES) {
    d2 /= 2
    step *= 2
  }
  const alp = 2 - 2 * d2 / MAX_VISIBLE_DATES

  if (step != this.datesStep) {
    let increase = step > this.datesStep

    if (increase) {
      this.alpha = this.increateStep ? 1 : Math.min(this.alpha, alp)
      this.drawStep = step
    } else {
      this.alpha = this.increateStep ? Math.max(this.alpha, alp) : 0
      this.drawStep = step * 2
    }

    this.increateStep = increase
    this.datesStep = step
  } else {

    if (this.increateStep) {
      this.alpha = Math.min(this.alpha, alp)
    } else {
      this.alpha = Math.max(this.alpha, alp)
    }
  }

  let mod = this.scope.graphView.inclIntStart % this.drawStep
  let startInd = this.scope.graphView.inclIntStart
  if (mod) {
    startInd += (this.drawStep - mod)
  }

  let colWidth = this.scope.graphView.scaleX
  let offset =  this.scope.graphView.firstOffscreenColOffset
  if (mod) {
    offset += (this.drawStep - mod) * colWidth
  }

  this.startIndex2 = startInd
  this.startOffset2 = offset
  let delta = - this.drawStep / 2
  this.startIndex1 = startInd + delta
  this.startOffset1 = offset + delta * colWidth
}

DatesAxis.prototype.animate = function(frameTime) {
  let needAnim = false
  const delta = (frameTime / 1000) / 0.5

  if (this.increateStep && this.alpha > 0) {
    this.alpha = Math.max(0, this.alpha - delta)
    needAnim = true
  } else if (!this.increateStep && this.alpha < 1) {
    this.alpha = Math.min(1, this.alpha + delta)
    needAnim = true
  }

  return needAnim
}
