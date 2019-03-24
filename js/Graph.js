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

Graph.prototype.draw = function(ctx, start, end, offsetX, offsetY, scaleX, scaleY) {
  if (this.alpha < MIN_VISIBLE_ALPHA && !this.visible) {
    return
  }

  ctx.beginPath()
  ctx.lineWidth = 2
  ctx.strokeStyle = this.color
  ctx.lineJoin = 'round'
  ctx.globalAlpha = this.alpha

  for (let i = start; i <= end; i++) {
    const x = offsetX
    const y = offsetY - this.values[i] * scaleY
    offsetX += scaleX

    if (i == start) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.stroke()
  ctx.globalAlpha = 1
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
