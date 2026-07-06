import { useEffect, useRef } from 'react'

export const useVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const { current: video } = videoRef
    if (video) {
      video.addEventListener('suspend', () => {
        // Video was suspended; fallback handling could go here.
      })
    }
  }, [])

  return { videoRef }
}
