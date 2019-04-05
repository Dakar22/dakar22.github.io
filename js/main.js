
/* Sorry for the mess in code. Visually it works, but inside... There's so much left to refactor :( */

window.onload = function () {
  const xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json")
  xobj.open('GET', 'chart_data.json', true)
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      const json = JSON.parse(xobj.responseText)
      init(json)
    }
  }
  xobj.send(null)
}


const TEXT_COLOR = '#aaa'
const FONT = '12px sans-serif'

const VERT_STEPS_COUNT = 5
const VERT_PIX_STEP = 60

const GRAPH_DATES_HEIGHT = 20
const GRAPH_HEIGHT = VERT_PIX_STEP * (VERT_STEPS_COUNT + 0.5) // 5 lines + 1/4 atop + 1/4 free
const SCROLLER_HEIGHT = 60

const MIN_VISIBLE_ALPHA = 0.03

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

let rootViewTemplate
let viewsContainer
var pixelRatio = 1
let nightMode = false
let windowWidth = 300

let rootViews = []


function init(json) {
  document.body.onresize = onResize
  rootViewTemplate = document.getElementById('view-root').content
  viewsContainer = document.querySelector('.views-container')
  pixelRatio = window.devicePixelRatio

  json.forEach(datum => {
    let root = new RootView(datum)
    rootViews.push(root)
  })

  onResize()

  let nightToggle = document.querySelector('#day-night-toggle')
  nightToggle.onchange = () => {
    nightMode = nightToggle.checked
    dayNightChanged()
  }

  // auto night mode
  let date = new Date(Date.now())
  let hours = date.getHours()
  if (hours > 21 || hours < 8) {
    nightToggle.setAttribute("checked", "true")
    nightMode = true
    dayNightChanged()
  }
}

function onResize() {
  windowWidth = viewsContainer.offsetWidth
  rootViews.forEach(root => root.resize())
}

function dayNightChanged() {
  const meta = document.querySelector('meta[name="theme-color"]')
  meta.setAttribute("content", nightMode ? '#101B2A' : '#fafafa')

  const cols = document.getElementsByClassName('night')
  for(let i=0; i<cols.length; i++) {
    let col = cols[i]
    cols[i].style.background = nightMode ? '#242F3E' : 'white';
    cols[i].style.color = nightMode ? 'white' : 'black';
    cols[i].style.setProperty('--color', nightMode ? '#242F3E' : 'white')
    cols[i].style.setProperty('--color-darker', nightMode ? '#151515' : '#f5f5f5')
  }
}

// utils ************************************************************************************************

//todo: compare speed of 'getDateStr()' and 'dateStart.toLocaleString('en-us', { month: 'short', day: 'numeric' })'
function getDateStr(time, dayOfWeek) {
  const date = new Date(time);
  const mon = MONTHS[date.getMonth()]
  const day = dayOfWeek ? (DAYS_OF_WEEK[date.getDay()] + ', ') : ''
  return day + mon + ' ' + date.getDate()
}

function resizeCanvas(canvas, ctx, wt, ht) {
  canvas.style.width = wt + 'px'
  canvas.style.height = ht + 'px'
  canvas.width = wt * pixelRatio
  canvas.height = ht * pixelRatio
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
}
