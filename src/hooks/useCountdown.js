import { useEffect, useState } from 'react'

function getElapsedSince(startDate) {
  const now = Date.now()
  const start = startDate.getTime()
  const diff = Math.max(0, now - start)

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)

  return { days, hours, minutes }
}

export function useCountdown(startDate) {
  const [elapsed, setElapsed] = useState(() => getElapsedSince(startDate))

  useEffect(() => {
    const tick = () => setElapsed(getElapsedSince(startDate))
    tick()

    const interval = setInterval(tick, 60_000)
    return () => clearInterval(interval)
  }, [startDate])

  return elapsed
}
