import { useEffect, useRef } from 'react'
import echo from '../echo'

export function useSocket(event, handler) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    echo.connect()
    const channel = echo.channel('orders')

    const wrapped = (e) => handlerRef.current(e)
    channel.listen(`.${event}`, wrapped)

    return () => {
      channel.stopListening(`.${event}`, wrapped)
    }
  }, [event])
}

export function useSocketConnect() {
  useEffect(() => {
    echo.connect()
    return () => {}
  }, [])
}