import { useCallback, useEffect, useState } from 'react'
import {
  deleteMemory as deleteMemoryRequest,
  fetchMemories,
  fetchStaticMeta,
  fetchStaticPhotos,
  updateMemory as updateMemoryRequest,
  updateStaticMemoryTitle,
} from '../services/memories'

function titlesFromMeta(meta) {
  const titles = {}
  for (const [id, value] of Object.entries(meta || {})) {
    if (value?.title) titles[id] = value.title
  }
  return titles
}

export function useMemories() {
  const [memories, setMemories] = useState([])
  const [staticPhotos, setStaticPhotos] = useState({})
  const [staticTitles, setStaticTitles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMemories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [customMemories, photos, meta] = await Promise.all([
        fetchMemories(),
        fetchStaticPhotos(),
        fetchStaticMeta(),
      ])
      setMemories(customMemories)
      setStaticPhotos(photos)
      setStaticTitles(titlesFromMeta(meta))
    } catch (err) {
      setError(err.message)
      setMemories([])
      setStaticPhotos({})
      setStaticTitles({})
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

  const renameStaticMemory = useCallback(async (id, title) => {
    const result = await updateStaticMemoryTitle(id, title)
    setStaticTitles((current) => ({
      ...current,
      [id]: result.title,
    }))
    return result
  }, [])

  const applyStaticTitle = useCallback((id, title) => {
    setStaticTitles((current) => ({
      ...current,
      [id]: title,
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
    staticTitles,
    loading,
    error,
    reloadMemories: loadMemories,
    addMemory,
    replaceMemory,
    removeMemory,
    updateStaticPhotos,
    renameStaticMemory,
    applyStaticTitle,
    updateMemory,
    deleteMemory,
  }
}
