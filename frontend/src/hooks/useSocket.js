import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:3001'

let socket = null

function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false })
  }
  return socket
}

export function useSocket(event, handler) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const s = getSocket()
    if (!s.connected) s.connect()

    const wrapped = (...args) => handlerRef.current(...args)
    s.on(event, wrapped)

    return () => {
      s.off(event, wrapped)
    }
  }, [event])
}

export function useSocketConnect() {
  useEffect(() => {
    const s = getSocket()
    if (!s.connected) s.connect()
    return () => {}
  }, [])
}
