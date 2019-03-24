GraphView = function(scope) {
  this.scope = scope

  this.indexStart = 0
  this.indexEnd = 0
  this.interval
  this.intervalMaxVal = 0

  this.scaleX = 1
  this.scaleY = 1

  this.firstOffscreenColOffset = 0
  this.inclIntStart = 0
  this.inclIntEnd = 0

  this.canvasGraph = this.scope.rootView.querySelector('.graph-container canvas')
  this.ctxGraph = this.canvasGraph.getContext('2d')
}

GraphView.prototype.constructor = GraphView

GraphView.prototype.draw = function() {
  const wt = windowWidth
  const ht = GRAPH_HEIGHT
  this.ctxGraph.clearRect(0, 0, wt, ht + GRAPH_DATES_HEIGHT)

  this.scope.valuesAxis.draw()
  this.scope.datesAxis.draw()

  this.scope.graphs.forEach(gr => {
    gr.draw(this.ctxGraph, this.inclIntStart, this.inclIntEnd, this.firstOffscreenColOffset, GRAPH_HEIGHT, this.scaleX, this.scaleY)
  })
}

GraphView.prototype.updateParams = function() {
  const wt = windowWidth
  const ht = GRAPH_HEIGHT

  this.indexStart = ( this.scope.count - 1) *  this.scope.intervalStart / wt
  this.indexEnd = ( this.scope.count - 1) *  this.scope.intervalEnd / wt

  this.inclIntStart = Math.floor(this.indexStart)
  this.inclIntEnd = Math.ceil(this.indexEnd)

  this.intervalMaxVal = 0
  this.scope.graphs.forEach(gr => {
    if (gr.visible) {
      this.intervalMaxVal = Math.max(this.intervalMaxVal, gr.getMaxValue(this.inclIntStart, this.inclIntEnd))
    }
  })

  this.interval = this.indexEnd - this.indexStart

  this.scaleX = wt / this.interval

  this.firstOffscreenColOffset = (this.inclIntStart - this.indexStart) * this.scaleX
}

GraphView.prototype.animate = function(frameTime) {
  let needAnim = false
  this.scope.graphs.forEach(gr => {
    if (gr.visible && gr.alpha < 1) {
      gr.alpha = Math.min(1, gr.alpha + frameTime / 350)
      needAnim = true
    } else if (!gr.visible && gr.alpha > 0) {
      gr.alpha = Math.max(0, gr.alpha - frameTime / 350)
      needAnim = true
    }
  })
  return needAnim
}

GraphView.prototype.toScreenX = function(graphX) {
  return (graphX - this.indexStart) * this.scaleX
}

GraphView.prototype.toScreenY = function(graphY) {
  return GRAPH_HEIGHT - graphY * this.scaleY
}

GraphView.prototype.fromScreenX = function(screenY) {
  return screenY / this.scaleX + this.indexStart
}

GraphView.prototype.fromScreenY = function(screenY) {
  return (GRAPH_HEIGHT - screenY) / this.scaleX
}
