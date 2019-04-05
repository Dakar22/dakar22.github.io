Slicer = function(scope) {
  this.scope = scope

  this.slicerItems = []

  this.slicer = this.scope.rootView.querySelector('.slicer')
  this.slicerLabel = this.slicer.querySelector('.slicer-label')

  this.slicerLabelDate = this.slicerLabel.querySelector('.slicer-label-date')
  this.slicerLabelValues = this.slicerLabel.querySelector('.slicer-label-values')

  let wrapper = this.onSlicerMouseLeave.bind(this)
  this.scope.graphView.canvasGraph.onmousemove = this.onSlicerMouseMove.bind(this)
  this.scope.graphView.canvasGraph.onmouseleave = wrapper

  //todo: does not work for touches. they should listen whole window. and un-listen if no need

  this.scope.graphView.canvasGraph.ontouchmove = wrapper
  this.scope.graphView.canvasGraph.ontouchleave = wrapper
  this.scope.graphView.canvasGraph.ontouchcancel = wrapper

  this.init()
}

Slicer.prototype.constructor = Slicer

Slicer.prototype.init = function() {
  let itemTemplate = document.getElementById('slicer-item-value').content

  this.scope.graphs.forEach(graph => {
    let clone = itemTemplate.cloneNode(true)
    let s = clone.querySelector('span')
    let p = clone.querySelector('p')
    let d = clone.querySelector('div')

    d.style.color = graph.color
    s.innerText = graph.name

    this.slicerLabelValues.appendChild(clone)

    let c = document.createElement('div')
    c.style.borderColor = graph.color
    c.className = 'slicer-circle night'
    this.slicer.appendChild(c)

    this.slicerItems.push({
      circle: c,
      value: p,
      item: d
    })
  })
}

Slicer.prototype.onSlicerMouseMove = function(e) {
  let x = e.layerX

  this.slicer.style.display = 'block'

  const nearest = this.getNearest(x)
  let index = nearest.index
  const dateText = this.getDateAtIndex(index)
  x = nearest.x

  this.slicerLabelDate.innerText = dateText

  var count = 0

  this.scope.graphs.forEach((graph, i) => {

    let item = this.slicerItems[i]
    let circle = item.circle

    if (graph.visible) {
      let value = graph.values[index]

      let y = this.scope.graphView.toScreenY(value) - 6
      circle.style.display = 'block'
      circle.style.top = y + 'px'

      count++

      item.value.innerText = value
      item.item.style.display = 'block'

    } else {
      circle.style.display = 'none'
      item.item.style.display = 'none'
    }
  })

  this.slicerLabelValues.style.flexDirection = (count > 2) ? 'column' : 'row'

  const wt = this.slicerLabel.offsetWidth

  this.slicer.style.left = x + 'px'

  if ((x + 20 + wt + 10) > windowWidth) {
    x = - (wt + 20)
  } else {
    x = 20
  }

  this.slicerLabel.style.left = x + 'px'
}

Slicer.prototype.onSlicerMouseLeave = function(e) {
  this.slicer.style.display = 'none'
}

Slicer.prototype.getNearest = function(mouseX) {
  const i = Math.round(this.scope.graphView.fromScreenX(mouseX))
  const x = this.scope.graphView.toScreenX(i)
  return {index: i, x: x}
}

Slicer.prototype.getDateAtIndex = function(index) {
  return getDateStr(this.scope.times[index], true)
}
