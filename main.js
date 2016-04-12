function isHomeTz (tz) {
  return tz === moment.tz.guess()
}

// Inserts a new row based on a given timezone
function addRow (tz, basedate) {
  var homeIcon = isHomeTz(tz) ? "<a class='home'>⌂</a>" : ""
  var rows = document.querySelector('#rows')
  var row = `<div class='row' data-tz=${tz}><section class='meta'><p>${tz.split('/')[tz.split('/').length - 1]}</p><a class='remove' onClick='clickRemove("${tz}")'>&times;</a>${homeIcon}</section>`
  var currentHour = moment(basedate).tz(tz).hour()
  for ( i = 0; i < 24; i++ ) {
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
  highlightCurrentHour()
  hoverHandlers() // Must reset handlers upon adding new row
}

function removeRow (tz) {
  document.querySelector(`.row[data-tz="${tz}"]`).remove()
  highlightCurrentHour()
}

// Highlights entire column on hover
function hoverHandlers () {
  var hours = document.querySelectorAll('#rows>.row>.hour')
  for ( i = 0; i < hours.length; i++ ) {
    var hour = hours[i]
    var hoveredHourElems = null;
    var hoveredHourElemsStyles = null;
    hour.addEventListener('mouseover', function (e) {
      var hourElem = e.target.closest('.hour')
      var index = Array.prototype.indexOf.call(hourElem.parentNode.children, hourElem) + 1
      hoveredHourElems = document.querySelectorAll(`.hour:nth-child(${index})`)
      hoveredHourElemsStyles = []
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
    if (activeZones.add(tzSelect.value)) {
      addRow(tzSelect.value, today)
      $('#tzSelect').val(null).trigger('change')
    }
  }
}

// Event handler for removing row
function clickRemove (tz) {
  if (activeZones.remove(tz)) {
    removeRow(tz)
  }
}

// Keep track of active zones and load saved zones
function ActiveZones () {
  this.zones = new Array()
  var savedTzs = JSON.parse(localStorage.getItem('savedTzs'))
  if (savedTzs) { 
    savedTzs.forEach(function (tz) { this.zones.push(tz) }.bind(this))
  }
  return this
}

ActiveZones.prototype.add = function (item, first) {
  if (this.zones.indexOf(item) > -1) return false
  if (first) this.zones.unshift(item)
  else this.zones.push(item)
  localStorage.setItem('savedTzs', JSON.stringify(this.zones))
  return true
}

ActiveZones.prototype.remove = function (item) {
  var idx = this.zones.indexOf(item)
  if (idx === -1) return false
  this.zones.splice(idx, 1)
  localStorage.setItem('savedTzs', JSON.stringify(this.zones))
  return true
}

// Today
var today = moment().startOf('day')

// Guess user's timezone, default to London
var utz = document.querySelector('#utz')
var userTimeZone = moment.tz.guess() || "Europe/London"
utz.innerHTML = userTimeZone

// Init activeZones list
var activeZones = new ActiveZones()

// Insert user's timezone to front of active zones
activeZones.add(userTimeZone, true)

// Add row for each timezone in active zones
activeZones.zones.forEach(function (zone) {
  addRow(zone, today)
})

// Populate Timzone Select Box
var tzSelect = document.querySelector('#tzSelect')
var timezones = moment.tz.names()
timezones.forEach(function (zone) {
  var option = document.createElement('option')
  option.text = zone
  tzSelect.add(option)
})

// Run a clock element on the page
var timeNode = document.querySelector('#time')
var displayedTime = null
function showTime () {
  var now = moment().format('HH:mm')
  if (displayedTime !== now) {
    displayedTime = now
    timeNode.innerHTML = displayedTime
  }
}
showTime()
setInterval(showTime, 1000)

var $selectBox = $("#tzSelect").select2({
  placeholder: "Add another timezone"
})
// $(document).ready(function() {
// })
