import { useEffect, useState } from 'react'
import { getRelationshipDuration } from '../utils/relationshipDuration'

function msUntilNextMidnight() {
  const now = new Date()
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  )
  return tomorrow.getTime() - now.getTime()
}

export function useRelationshipDuration(startDate) {
  const [duration, setDuration] = useState(() =>
    getRelationshipDuration(startDate),
  )

  useEffect(() => {
    const tick = () => setDuration(getRelationshipDuration(startDate))
    tick()

    let timeoutId
    let intervalId

    const scheduleNextUpdate = () => {
      timeoutId = setTimeout(() => {
        tick()
        intervalId = setInterval(tick, 24 * 60 * 60 * 1000)
      }, msUntilNextMidnight())
    }

    scheduleNextUpdate()

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [startDate])

  return duration
}
