

//todo: pass scope as arg


const MIN_THUMB_WIDTH = 60

Inputs = function(scope) {
  this.scope = scope

  this.initMouseX
  this.moveMultiplier = 1
  this.moveStart = false
  this.moveEnd = false
  this.touchMode
  this.deltaMin
  this.deltaMax
  this.initIntStart
  this.initIntEnd

  this.moveWrapper = this.onThumbMove.bind(this)
  this.upWrapper = this.onThumbUp.bind(this)

   this.scope.graphView.canvasGraph.onmousedown = this.onGraphDown.bind(this)
   this.scope.graphView.canvasGraph.ontouchstart = this.onGraphDown.bind(this)
   this.scope.scrollView.canvasScroller.onmousedown = this.onThumbDown.bind(this)
   this.scope.scrollView.canvasScroller.ontouchstart = this.onThumbDown.bind(this)

  this.scope.graphView.canvasGraph.addEventListener('gesturestart', (e) => {
    alert('e')
  })
}

Inputs.prototype.constructor = Inputs

Inputs.prototype.onGraphDown = function(e) {
  this.moveMultiplier = - ( this.scope.intervalEnd -  this.scope.intervalStart) / windowWidth
  this.onMouseDown(e, true, true)
}

Inputs.prototype.onThumbDown = function(e) {
  this.moveMultiplier = 1
  var initX = this.getXPos(e)
  var willChangeStart = initX <  this.scope.intervalEnd - 8 || initX >  this.scope.intervalEnd + 22
  var willChangeEnd = !willChangeStart || (initX >  this.scope.intervalStart + 8 || initX <  this.scope.intervalStart - 22)
  this.onMouseDown(e, willChangeStart, willChangeEnd)
}

Inputs.prototype.onMouseDown = function(e, willChangeStart, willChangeEnd) {

  //e.preventDefault()
  this.touchMode = e.type == 'touchstart'
  this.initMouseX = this.getXPos(e)

  if (this.initMouseX === undefined) {
    return
  }

  //e.preventDefault();
  //e.stopPropagation();

  if (this.touchMode) {
    window.ontouchmove = this.moveWrapper
    window.ontouchend = this.upWrapper
    window.ontouchleave = this.upWrapper
    window.ontouchcancel = this.upWrapper
  } else {
    window.onmousemove = this.moveWrapper
    window.onmouseup = this.upWrapper
  }

  this.moveStart = willChangeStart
  this.moveEnd = willChangeEnd

  this.initIntStart =  this.scope.intervalStart
  this.initIntEnd =  this.scope.intervalEnd

  this.deltaMin = - this.scope.intervalStart
  this.deltaMax = windowWidth -  this.scope.intervalEnd

  var alt =  this.scope.intervalEnd -  this.scope.intervalStart - MIN_THUMB_WIDTH
  if (!this.moveEnd) {
    this.deltaMax = alt
  } else if (!this.moveStart) {
    this.deltaMin = - alt
  }
}

Inputs.prototype.onThumbMove = function(e) {
  var mouseX = this.getXPos(e)

  var delta = (mouseX - this.initMouseX) * this.moveMultiplier
  delta = Math.min(delta, this.deltaMax)
  delta = Math.max(delta, this.deltaMin)

  if (this.moveStart) {
    this.scope.intervalStart = this.initIntStart + delta
  }
  if (this.moveEnd) {
    this.scope.intervalEnd = this.initIntEnd + delta
  }

  this.scope.updateParams()
  this.scope.scrollView.updateThumb()
}

Inputs.prototype.onThumbUp = function(e) {
  if (this.touchMode) {
  	window.ontouchmove = undefined
  	window.ontouchend = undefined
    window.ontouchleave = undefined
    window.ontouchcancel = undefined
  } else {
  	window.onmousemove = undefined
  	window.onmouseup = undefined
  }
}

Inputs.prototype.getXPos = function(e) {
  return this.touchMode ? (e.touches[0].screenX - 20) : e.layerX
}
