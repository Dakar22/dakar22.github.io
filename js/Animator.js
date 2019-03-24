
Animator = function(scope) {
  this.scope = scope

  this.prevFrameTime = Date.now()

  this.enterFrameWrapper = this.enterFrame.bind(this)

  window.requestAnimationFrame(this.enterFrameWrapper)

  this._needUpdateGraph = false
  this._needUpdateScroll = false

  this.prevFrameWasUpdated = false
}

Animator.prototype.constructor = Animator


Animator.prototype.needUpdateGraph = function() {
  this._needUpdateGraph = true
  this.startAnim()
}

Animator.prototype.needUpdateScroll = function() {
  this._needUpdateScroll = true
  this.startAnim()
}


Animator.prototype.startAnim = function() {
  if (!this.prevFrameWasUpdated) {
    this.prevFrameWasUpdated = true

    this.prevFrameTime = Date.now()
    window.requestAnimationFrame(this.enterFrameWrapper)
  }
}


Animator.prototype.enterFrame = function() {
  const time = Date.now()
  const delta = time - this.prevFrameTime
  this.prevFrameTime = time

  this.prevFrameWasUpdated = this.animate(delta)
  if (this.prevFrameWasUpdated) {
    window.requestAnimationFrame(this.enterFrameWrapper)
  }
}


Animator.prototype.animate = function(frameTime) {

  let needUpdate = this._needUpdateGraph
  let needUpdateScroller = this._needUpdateScroll

  this._needUpdateGraph = false
  this._needUpdateScroll = false

  needUpdate =  this.scope.datesAxis.animate(frameTime) || needUpdate

  needUpdate =  this.scope.valuesAxis.animate(frameTime) || needUpdate

  let upd =  this.scope.graphView.animate(frameTime)
  needUpdate = upd || needUpdate
  needUpdateScroller = upd || needUpdateScroller

  needUpdateScroller =  this.scope.scrollView.animate(frameTime) || needUpdateScroller

  if (needUpdate) {
    this.scope.graphView.draw()
  }
  if (needUpdateScroller) {
    this.scope.scrollView.draw()
  }

  return needUpdate || needUpdateScroller
}
