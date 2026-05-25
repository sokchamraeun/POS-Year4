import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher
Pusher.logToConsole = true

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  cluster: 'mt1',
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT),
  forceTLS: false,
  encrypted: false,
  enableStats: false,
})

export default echo