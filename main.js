// Inserts a new row based on a given timezone
function addRow (tz, basedate) {
  var rows = document.querySelector('#rows')
  var row = `<div class='row' data-tz=${tz}><section class='meta'><p>${tz.split('/')[tz.split('/').length - 1]}</p></section>`
  var currentHour = moment(basedate).tz(tz).hour()
  for ( i = 0; i < 25; i++ ) {
    if (currentHour === 0) {
      row += `<section class='hour'><p>${moment(basedate).tz(tz).add(i, 'hours').format('MMM D')}</p></section>` 
    } else {
      row += `<section class='hour'><p>${currentHour}</p></section>`
    }
    if (currentHour === 23) {
      currentHour = 0
    } else {
      currentHour++
    }
  }
  row += '</div>'
  rows.innerHTML = rows.innerHTML + row
  ActiveZones.push(tz)
  hoverHandlers() // Must reset handlers upon adding new row
  highlightCurrentHour()
}

function removeRow (tz) {
  var index = ActiveZones.indexOf(tz)
  document.querySelector(`#rows>.row:nth-child(${index + 1})`).remove()
  ActiveZones.splice(index, 1)
  highlightCurrentHour()
}

// Highlights entire column on hover
function hoverHandlers () {
  var hours = document.querySelectorAll('#rows>.row>.hour')
  for ( i = 0; i < hours.length; i++ ) {
    var hour = hours[i]
    var hoveredHourElems = null;
    hour.addEventListener('mouseover', function (e) {
      var hourElem = e.target.closest('.hour')
      var index = Array.prototype.indexOf.call(hourElem.parentNode.children, hourElem) + 1
      hoveredHourElems = document.querySelectorAll(`.hour:nth-child(${index})`)
      for ( i = 0; i < hoveredHourElems.length; i++ ) {
        var hoveredElem = hoveredHourElems[i]
        hoveredElem.style.background = 'rgb(245, 245, 245)'
      }
    })
    hour.addEventListener('mouseout', function (e) {
      for ( i = 0; i < hoveredHourElems.length; i++ ) {
        var hoveredElem = hoveredHourElems[i]
        hoveredElem.style.background = 'transparent'
      }
    })
  }
}

// Border around current hour column
function highlightCurrentHour() {
  var now = moment().hour()
  var nowColumn = document.querySelectorAll(`#rows>.row>.hour:nth-child(${now + 2})`)
  for ( i = 0; i < nowColumn.length; i++ ) {
    var hour = nowColumn[i]
    hour.style.border = '1px solid rgba(0, 120, 165, 0.8)'
    if (i !== 0) {
      hour.style['border-top'] = 'none'
    }
    if (i !== nowColumn.length - 1) {
      hour.style['border-bottom'] = 'none'
    }
  }
}

// Event Handler for add row button
function clickAdd () {
  var tzSelect = document.querySelector('#tzSelect')
  if (tzSelect.value) {
    addRow(tzSelect.value, today)
    tzSelect.value = ''
  }
}

// Get Today
var today = moment().startOf('day')

// Keep track of active zones
var ActiveZones = []

// Guess user's timezone, default to London
var utz = document.querySelector('#utz')
var userTimeZone = moment.tz.guess() || "Europe/London"
utz.innerHTML = userTimeZone

// Add user's timezone to rows
addRow(userTimeZone, today)

// Add Zones Saved in localStorage
var userZones = JSON.parse(localStorage.getItem('timezones'))
if (userZones) {
  userZones.forEach(function (zone) {
    addRow(zone, today)
  })
}

// Populate Timzone Select Box
var tzSelect = document.querySelector('#tzSelect')
var timezones = moment.tz.names()
timezones.forEach(function (zone) {
  var option = document.createElement('option')
  option.text = zone
  tzSelect.add(option)
})
