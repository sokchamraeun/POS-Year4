import { useEffect, useRef } from 'react'
import { getEcho } from '../echo'

export function useSocket(event, handler) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const echo = getEcho()
    if (!echo) {
      console.warn('[useSocket] Echo not initialized (missing VITE_PUSHER_APP_KEY)')
      return
    }
    if (!echo.connector) {
      console.warn('[useSocket] Echo has no connector — Pusher may not be configured')
      return
    }
    echo.connect()
    const channel = echo.channel('orders')

    const wrapped = (e) => {
      handlerRef.current(e)
    }
    channel.listen(`.${event}`, wrapped)

    return () => {
      channel.stopListening(`.${event}`, wrapped)
    }
  }, [event])
}

export function useSocketConnect() {
  useEffect(() => {
    const echo = getEcho()
    if (!echo) return
    echo.connect()
    return () => {}
  }, [])
}