const STORAGE_KEY = 'anniversary-custom-memories'
const TOKEN_KEY = 'anniversary-admin-token'
const REQUEST_TIMEOUT_MS = 20_000

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

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'Le serveur met trop de temps à répondre. Vérifie la configuration Vercel (variables + Blob).',
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

  return new Promise((resolve, reject) => {
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
    const expected = import.meta.env.VITE_ADMIN_PASSWORD
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
  const compressedFiles = await Promise.all(
    photoFiles.map((file) => compressImage(file)),
  )

  const photos = await Promise.all(
    compressedFiles.map(async (file) => {
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
  const response = await fetchWithTimeout('/api/memories', {
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

  const data = await parseJsonResponse(response)
  if (!response.ok) {
    throw new Error(data.error ?? 'Erreur lors de la sauvegarde')
  }

  return data
}
