import { useCallback, useEffect, useState } from 'react'
import { createLetter, fetchLetters } from '../services/letters'

export function useLetters() {
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadLetters = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchLetters()
      setLetters(data)
    } catch (err) {
      setError(err.message)
      setLetters([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLetters()
  }, [loadLetters])

  const addLetter = useCallback((letter) => {
    setLetters((current) => [letter, ...current])
  }, [])

  return { letters, loading, error, reloadLetters: loadLetters, addLetter }
}
