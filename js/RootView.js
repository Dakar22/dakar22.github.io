RootView = function(json) {
  this.graphs = []
  this.times = []
  this.processData(json)

  this.count = this.times.length

  this.intervalStart = 120 //todo: better to move to scroll view
  this.intervalEnd = 200

  let clone = rootViewTemplate.cloneNode(true)
  this.rootView = clone.querySelector('.container')
  viewsContainer.appendChild(clone)

  this.checkboxes = this.rootView.querySelector('.checkboxes-container')
  this.noData = this.rootView.querySelector('.no-data')

  this.graphView = new GraphView(this)
  this.scrollView = new ScrollView(this)
  this.datesAxis = new DatesAxis(this)
  this.valuesAxis = new ValuesAxis(this)
  this.animator = new Animator(this)
  new Inputs(this)
  new Slicer(this)

  this.scrollView.updateParams()
  this.scrollView.updateThumb()

  this.addCheckboxes()
}

RootView.prototype.constructor = RootView


RootView.prototype.processData = function(json) {
  json.columns.forEach(col => {
    const title = col.shift()
    const typ = json.types[title]
    if (typ == 'x') {
      this.times = col
    } else if (typ == 'line') {
      this.graphs.push(new Graph(col, json.colors[title], json.names[title]))
    }
  })
}

RootView.prototype.addCheckboxes = function() {
  let template = document.getElementById('material-checkbox').content

  this.graphs.forEach((graph, i) => {
    let clone = template.cloneNode(true)
    let input = clone.querySelector('input')
    let d = clone.querySelector('div')
    let s = clone.querySelector('span')

    d.style.background = graph.color
    s.innerText = graph.name

    input.checked = true
    input.onchange = () => {
      this.checkboxChanged(i, input.checked)
    }

    this.checkboxes.appendChild(clone)
  })
}

RootView.prototype.checkboxChanged = function(index, value) {
  this.graphs[index].visible = value

  this.scrollView.updateParams()

  this.noData.style.display = this.scrollView.maxVal ? 'none' : 'flex'

  this.updateParams()
}

RootView.prototype.updateParams = function() {
  this.animator.needUpdateGraph()

  this.graphView.updateParams()
  this.datesAxis.updateParams()
  this.valuesAxis.updateParams()
}

RootView.prototype.resize = function() {
  resizeCanvas(this.graphView.canvasGraph, this.graphView.ctxGraph, windowWidth, GRAPH_HEIGHT + GRAPH_DATES_HEIGHT)
  resizeCanvas(this.scrollView.canvasScroller, this.scrollView.ctxScroller, windowWidth, SCROLLER_HEIGHT)

  this.updateParams()
  this.animator.needUpdateScroll()
}
