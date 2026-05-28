import Echo from 'laravel-echo'
import Pusher from 'pusher-js/dist/web/pusher'

const key = import.meta.env.VITE_PUSHER_APP_KEY
const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1'

let echo = null

if (key) {
  window.Pusher = Pusher
  if (import.meta.env.DEV) {
    Pusher.logToConsole = true
  }

  echo = new Echo({
    broadcaster: 'pusher',
    key,
    cluster,
    forceTLS: true,
  })

  window.Echo = echo
}

export default echo