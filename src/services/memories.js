const STORAGE_KEY = 'anniversary-custom-memories'
const TOKEN_KEY = 'anniversary-admin-token'

function isLocalMode() {
  return import.meta.env.DEV && !import.meta.env.VITE_USE_API
}

function readLocalMemories() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeLocalMemories(memories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories))
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
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

  const response = await fetch('/api/memories')
  if (!response.ok) throw new Error('Impossible de charger les souvenirs')
  return response.json()
}

export async function verifyPassword(password) {
  if (isLocalMode()) {
    const expected = import.meta.env.VITE_ADMIN_PASSWORD
    if (!expected || password !== expected) {
      throw new Error('Mot de passe incorrect')
    }
    sessionStorage.setItem(TOKEN_KEY, 'local-dev-token')
    return { token: 'local-dev-token' }
  }

  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? 'Mot de passe incorrect')

  sessionStorage.setItem(TOKEN_KEY, data.token)
  return data
}

export async function createMemory({ title, date, photoFiles }) {
  const photos = await Promise.all(
    photoFiles.map(async (file) => {
      const dataUrl = await readFileAsDataUrl(file)
      return {
        name: file.name,
        data: dataUrl.split(',')[1],
        preview: dataUrl,
      }
    }),
  )

  if (isLocalMode()) {
    const memory = {
      id: crypto.randomUUID(),
      title: title.trim(),
      date,
      photos: photos.map((photo) => photo.preview),
      createdAt: new Date().toISOString(),
      custom: true,
    }

    const memories = readLocalMemories()
    memories.push(memory)
    writeLocalMemories(memories)
    return memory
  }

  const token = getStoredToken()
  const response = await fetch('/api/memories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      date,
      photos: photos.map(({ name, data }) => ({ name, data })),
    }),
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? 'Erreur lors de la sauvegarde')
  return data
}
