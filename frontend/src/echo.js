import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher
if (import.meta.env.DEV) {
  Pusher.logToConsole = true
}

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
  forceTLS: true,
})

export default echo