import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher
if (import.meta.env.DEV) {
  Pusher.logToConsole = true
}

const apiUrl = import.meta.env.VITE_API_URL || ''
const reverbHost = import.meta.env.VITE_REVERB_HOST
const wsHost = reverbHost && reverbHost !== 'localhost'
  ? reverbHost
  : apiUrl.replace(/^https?:\/\//, '').replace(/\/api.*$/, '') || window.location.hostname

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  cluster: 'mt1',
  wsHost,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT),
  forceTLS: import.meta.env.PROD,
  encrypted: import.meta.env.PROD,
  enableStats: false,
})

export default echo