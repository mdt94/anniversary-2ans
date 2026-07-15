import { useCallback, useEffect, useState } from 'react'
import {
  deleteMemory as deleteMemoryRequest,
  fetchMemories,
  updateMemory as updateMemoryRequest,
} from '../services/memories'

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

  const replaceMemory = useCallback((memory) => {
    setMemories((current) =>
      current.map((item) => (item.id === memory.id ? memory : item)),
    )
  }, [])

  const removeMemory = useCallback((id) => {
    setMemories((current) => current.filter((item) => item.id !== id))
  }, [])

  const updateMemory = useCallback(
    async (id, payload) => {
      const updated = await updateMemoryRequest(id, payload)
      replaceMemory(updated)
      return updated
    },
    [replaceMemory],
  )

  const deleteMemory = useCallback(
    async (id) => {
      await deleteMemoryRequest(id)
      removeMemory(id)
    },
    [removeMemory],
  )

  return {
    memories,
    loading,
    error,
    reloadMemories: loadMemories,
    addMemory,
    replaceMemory,
    removeMemory,
    updateMemory,
    deleteMemory,
  }
}
