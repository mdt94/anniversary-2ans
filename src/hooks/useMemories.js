import { useCallback, useEffect, useState } from 'react'
import { fetchMemories } from '../services/memories'

export function useMemories() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMemories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchMemories()
      setMemories(data)
    } catch (err) {
      setError(err.message)
      setMemories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMemories()
  }, [loadMemories])

  const addMemory = useCallback((memory) => {
    setMemories((current) => [...current, memory])
  }, [])

  return { memories, loading, error, reloadMemories: loadMemories, addMemory }
}
