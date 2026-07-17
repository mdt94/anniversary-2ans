import { upload } from '@vercel/blob/client'

const STORAGE_KEY = 'anniversary-custom-memories'
const STATIC_PHOTOS_KEY = 'anniversary-static-photos'
const TOKEN_KEY = 'anniversary-admin-token'
const REQUEST_TIMEOUT_MS = 20_000
const REMOVED_TEST_DATES = new Set(['2022-06-15', '2026-07-17'])

function isLocalMode() {
  return import.meta.env.DEV && !import.meta.env.VITE_USE_API
}

function readLocalMemories() {
  try {
    const memories = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return memories.filter((memory) => !REMOVED_TEST_DATES.has(memory.date))
  } catch {
    return []
  }
}

function readLocalStaticPhotos() {
  try {
    return JSON.parse(localStorage.getItem(STATIC_PHOTOS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeLocalStaticPhotos(photos) {
  localStorage.setItem(STATIC_PHOTOS_KEY, JSON.stringify(photos))
}

function writeLocalMemories(memories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories))
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'Le serveur met trop de temps à répondre. Vérifie la configuration Vercel.',
      )
    }
    throw new Error('Impossible de contacter le serveur.')
  } finally {
    clearTimeout(timeout)
  }
}

async function parseJsonResponse(response) {
  const text = await response.text()

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(
      'Réponse serveur invalide. Les API ne semblent pas correctement déployées.',
    )
  }
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Impossible de lire la photo'))
    reader.readAsDataURL(file)
  })
}

async function compressImage(file, maxWidth = 1200, quality = 0.82) {
  if (!file.type.startsWith('image/')) return file

  return new Promise((resolve) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const scale = Math.min(1, maxWidth / image.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)

      const context = canvas.getContext('2d')
      if (!context) {
        resolve(file)
        return
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }

          const compressedName = file.name.replace(/\.[^.]+$/, '.jpg')
          resolve(new File([blob], compressedName, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality,
      )
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file)
    }

    image.src = objectUrl
  })
}

async function uploadPhotos(photoFiles) {
  const token = getStoredToken()
  const compressedFiles = await Promise.all(
    photoFiles.map((file) => compressImage(file)),
  )

  const urls = []

  for (const file of compressedFiles) {
    const result = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    urls.push(result.url)
  }

  return urls
}

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function clearStoredToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export async function fetchMemories() {
  if (isLocalMode()) {
    return readLocalMemories()
  }

  const response = await fetchWithTimeout('/api/memories')
  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data.error ?? 'Impossible de charger les souvenirs')
  }

  return data
}

export async function verifyPassword(password) {
  if (isLocalMode()) {
    let expected = import.meta.env.VITE_ADMIN_PASSWORD
    try {
      const config = JSON.parse(
        localStorage.getItem('anniversary-site-config') ?? 'null',
      )
      if (config?.localPassword) expected = config.localPassword
    } catch {
      // ignore
    }

    if (!expected || password !== expected) {
      throw new Error('Mot de passe incorrect')
    }
    sessionStorage.setItem(TOKEN_KEY, 'local-dev-token')
    return { token: 'local-dev-token' }
  }

  const response = await fetchWithTimeout('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })

  const data = await parseJsonResponse(response)
  if (!response.ok) {
    throw new Error(data.error ?? 'Mot de passe incorrect')
  }

  sessionStorage.setItem(TOKEN_KEY, data.token)
  return data
}

export async function createMemory({ title, date, photoFiles }) {
  if (isLocalMode()) {
    const photos = await Promise.all(
      photoFiles.map(async (file) => {
        const dataUrl = await readFileAsDataUrl(await compressImage(file))
        return dataUrl
      }),
    )

    const memory = {
      id: crypto.randomUUID(),
      title: title.trim(),
      date,
      photos,
      createdAt: new Date().toISOString(),
      custom: true,
    }

    const memories = readLocalMemories()
    memories.push(memory)
    writeLocalMemories(memories)
    return memory
  }

  const photoUrls = photoFiles.length > 0 ? await uploadPhotos(photoFiles) : []
  const token = getStoredToken()

  const response = await fetchWithTimeout('/api/memories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      date,
      photoUrls,
    }),
  })

  const data = await parseJsonResponse(response)
  if (!response.ok) {
    throw new Error(data.error ?? 'Erreur lors de la sauvegarde')
  }

  return data
}

export async function updateMemory(id, { title, date, existingPhotos = [], photoFiles = [] }) {
  if (isLocalMode()) {
    const newPhotos =
      photoFiles.length > 0
        ? await Promise.all(
            photoFiles.map(async (file) => {
              const dataUrl = await readFileAsDataUrl(await compressImage(file))
              return dataUrl
            }),
          )
        : []

    const memories = readLocalMemories()
    const index = memories.findIndex((memory) => memory.id === id)
    if (index === -1) throw new Error('Souvenir introuvable')

    const updated = {
      ...memories[index],
      title: title.trim(),
      date,
      photos: [...existingPhotos, ...newPhotos],
      updatedAt: new Date().toISOString(),
    }

    memories[index] = updated
    writeLocalMemories(memories)
    return updated
  }

  const uploadedUrls =
    photoFiles.length > 0 ? await uploadPhotos(photoFiles) : []
  const token = getStoredToken()

  const response = await fetchWithTimeout(`/api/memories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      date,
      photoUrls: [...existingPhotos, ...uploadedUrls],
    }),
  })

  const data = await parseJsonResponse(response)
  if (!response.ok) {
    throw new Error(data.error ?? 'Erreur lors de la modification')
  }

  return data
}

export async function deleteMemory(id) {
  if (isLocalMode()) {
    const memories = readLocalMemories()
    const next = memories.filter((memory) => memory.id !== id)
    if (next.length === memories.length) {
      throw new Error('Souvenir introuvable')
    }
    writeLocalMemories(next)
    return { ok: true }
  }

  const token = getStoredToken()
  const response = await fetchWithTimeout(`/api/memories/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await parseJsonResponse(response)
  if (!response.ok) {
    throw new Error(data.error ?? 'Erreur lors de la suppression')
  }

  return data
}

export async function fetchStaticPhotos() {
  if (isLocalMode()) {
    return readLocalStaticPhotos()
  }

  const response = await fetchWithTimeout('/api/static-photos')
  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data.error ?? 'Impossible de charger les photos')
  }

  return data
}

export async function appendPhotosToMemory(memoryId, photoFiles) {
  const photoUrls = photoFiles.length > 0 ? await uploadPhotos(photoFiles) : []

  if (photoUrls.length === 0) {
    throw new Error('Ajoute au moins une photo')
  }

  if (isLocalMode()) {
    if (memoryId.startsWith('static-')) {
      const staticPhotos = readLocalStaticPhotos()
      const existing = Array.isArray(staticPhotos[memoryId])
        ? staticPhotos[memoryId]
        : []
      staticPhotos[memoryId] = [...existing, ...photoUrls]
      writeLocalStaticPhotos(staticPhotos)
      return { id: memoryId, photos: staticPhotos[memoryId] }
    }

    const memories = readLocalMemories()
    const index = memories.findIndex((memory) => memory.id === memoryId)
    if (index === -1) throw new Error('Souvenir introuvable')

    const updated = {
      ...memories[index],
      photos: [...(memories[index].photos ?? []), ...photoUrls],
      updatedAt: new Date().toISOString(),
    }

    memories[index] = updated
    writeLocalMemories(memories)
    return updated
  }

  const token = getStoredToken()
  const response = await fetchWithTimeout(`/api/memories/${memoryId}/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ photoUrls }),
  })

  const data = await parseJsonResponse(response)
  if (!response.ok) {
    throw new Error(data.error ?? 'Erreur lors de l\'ajout des photos')
  }

  return data
}
