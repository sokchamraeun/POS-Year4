// src/pages/staff/dashboard/hooks/useNotificationSound.js
import { useEffect, useRef } from 'react'

export function useNotificationSound() {
  const audioRef = useRef(null)
  const unlockedRef = useRef(false)

  useEffect(() => {
    const audio = new Audio('/sound.mp3')
    audio.volume = 0.5
    audio.load()
    audioRef.current = audio

    function unlock() {
      if (unlockedRef.current) return
      unlockedRef.current = true
      audio.play().then(() => {
        audio.pause()
        audio.currentTime = 0
      }).catch(() => {})
    }
    
    document.addEventListener('pointerdown', unlock, { once: true })
    document.addEventListener('keydown', unlock, { once: true })
    
    return () => {
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [])

  const playNotificationSound = () => {
    const audio = audioRef.current
    if (!audio) return
    
    const repeatCount = 3
    let played = 0
    
    function play() {
      if (played >= repeatCount) return
      played++
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
    
    audio.addEventListener('ended', play, { once: true })
    try { play() } catch { /* empty */ }
  }

  return { playNotificationSound }
}