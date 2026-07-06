import { useState } from 'react'

export const useServiceGallery = () => {
  const [current, setCurrent] = useState(0)
  return { current, setCurrent }
}
