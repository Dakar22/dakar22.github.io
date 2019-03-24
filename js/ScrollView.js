ScrollView = function(scope) {
  this.scope = scope

  this.maxVal = 0
  this.scaleX = 1
  this.scaleY = 1

  this.canvasScroller = this.scope.rootView.querySelector('.scroll-container canvas')
  this.thumb = this.scope.rootView.querySelector('.thumb')
  this.ctxScroller = this.canvasScroller.getContext('2d')

  this.startScrollAnimTime
  this.startScrollAnimValue
  this.currentScrollerMax = 0
}

ScrollView.prototype.constructor = ScrollView

ScrollView.prototype.draw = function() {
  const wt = windowWidth
  const ht = SCROLLER_HEIGHT

  this.ctxScroller.clearRect(0, 0, wt, ht)

  this.scope.graphs.forEach(gr => {
    let scaleY = (gr.alpha == 1) ? this.scaleY : (SCROLLER_HEIGHT / (gr.visible ? this.maxVal : this.startScrollAnimValue))
    gr.draw(this.ctxScroller, 0,  this.scope.count - 1, 0, ht, this.scaleX, scaleY)
  })
}

ScrollView.prototype.updateParams = function() {
  this.startScrollAnimTime = 0
  this.startScrollAnimValue = this.maxVal
  this.maxVal = 0
  this.scope.graphs.forEach(gr => {
    if (gr.visible) {
      this.maxVal = Math.max(this.maxVal, gr.maxValue)
    }
  })
}

ScrollView.prototype.animate = function(frameTime) {
  let needAnim = false
  if (this.currentScrollerMax != this.maxVal) {
    this.startScrollAnimTime += frameTime
    let tt = Math.min(this.startScrollAnimTime / 350, 1)
    this.currentScrollerMax = this.startScrollAnimValue + tt * (this.maxVal - this.startScrollAnimValue)
    this.scaleY = SCROLLER_HEIGHT / this.currentScrollerMax
    needAnim = true
  }

  this.scaleX = windowWidth / (this.scope.count - 1) //todo: only for init and resize. calc in another place

  return needAnim
}

ScrollView.prototype.updateThumb = function() {
  const left =  this.scope.intervalStart
  const len =  this.scope.intervalEnd -  this.scope.intervalStart
  this.thumb.style.left = left + 'px'
  this.thumb.style.width = len + 'px'
}
