import { useCallback, useEffect, useState } from 'react'
import {
  deleteMemory as deleteMemoryRequest,
  fetchMemories,
  fetchStaticPhotos,
  updateMemory as updateMemoryRequest,
} from '../services/memories'

export function useMemories() {
  const [memories, setMemories] = useState([])
  const [staticPhotos, setStaticPhotos] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMemories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [customMemories, photos] = await Promise.all([
        fetchMemories(),
        fetchStaticPhotos(),
      ])
      setMemories(customMemories)
      setStaticPhotos(photos)
    } catch (err) {
      setError(err.message)
      setMemories([])
      setStaticPhotos({})
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

  const updateStaticPhotos = useCallback((memoryId, photos) => {
    setStaticPhotos((current) => ({
      ...current,
      [memoryId]: photos,
    }))
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
    staticPhotos,
    loading,
    error,
    reloadMemories: loadMemories,
    addMemory,
    replaceMemory,
    removeMemory,
    updateStaticPhotos,
    updateMemory,
    deleteMemory,
  }
}
