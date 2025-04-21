import { Calendar } from '@fullcalendar/core'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import dayGridPlugin from '@fullcalendar/daygrid'

// import bootstrap stylesheets directly from your JS
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css' // needs additional webpack config!

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    bootstrap5Plugin,
    dayGridPlugin
  ],
  themeSystem: 'bootstrap5', // important!
  initialView: 'dayGridMonth'
})

calendar.render()