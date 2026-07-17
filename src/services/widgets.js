import { upload } from '@vercel/blob/client'
import {
  clearStoredToken,
  getStoredToken,
  verifyPassword,
} from './memories'

const STORAGE_KEY = 'anniversary-widgets'
const REQUEST_TIMEOUT_MS = 20_000

function isLocalMode() {
  return import.meta.env.DEV && !import.meta.env.VITE_USE_API
}

function readLocalWidgets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeLocalWidgets(widgets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets))
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Le serveur met trop de temps à répondre.')
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
    throw new Error('Réponse serveur invalide.')
  }
}

async function compressImage(file, maxWidth = 1000, quality = 0.82) {
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
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }
          resolve(
            new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
            }),
          )
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

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Impossible de lire la photo'))
    reader.readAsDataURL(file)
  })
}

async function uploadPhotos(photoFiles) {
  const token = getStoredToken()
  const urls = []

  for (const file of photoFiles) {
    const compressed = await compressImage(file)
    const result = await upload(compressed.name, compressed, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      headers: { Authorization: `Bearer ${token}` },
    })
    urls.push(result.url)
  }

  return urls
}

export { getStoredToken, clearStoredToken, verifyPassword }

export async function fetchWidgets() {
  if (isLocalMode()) return readLocalWidgets()

  const response = await fetchWithTimeout('/api/widgets')
  const data = await parseJsonResponse(response)
  if (!response.ok) throw new Error(data.error || 'Impossible de charger les widgets')
  return data.widgets ?? []
}

export async function createWidget({ title, caption, date, accent, photoFiles }) {
  let photos = []

  if (isLocalMode()) {
    photos = await Promise.all((photoFiles || []).map(readFileAsDataUrl))
    const widgets = readLocalWidgets()
    const widget = {
      id: crypto.randomUUID(),
      title: title.trim(),
      caption: (caption || '').trim(),
      date,
      photos,
      accent: accent || 'blush',
      createdAt: new Date().toISOString(),
    }
    writeLocalWidgets([widget, ...widgets])
    return widget
  }

  if (photoFiles?.length) {
    photos = await uploadPhotos(photoFiles)
  }

  const response = await fetchWithTimeout('/api/widgets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getStoredToken()}`,
    },
    body: JSON.stringify({ title, caption, date, accent, photos }),
  })
  const data = await parseJsonResponse(response)
  if (!response.ok) throw new Error(data.error || 'Création impossible')
  return data.widget
}

export async function deleteWidget(id) {
  if (isLocalMode()) {
    writeLocalWidgets(readLocalWidgets().filter((widget) => widget.id !== id))
    return
  }

  const response = await fetchWithTimeout(`/api/widgets?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getStoredToken()}` },
  })
  const data = await parseJsonResponse(response)
  if (!response.ok) throw new Error(data.error || 'Suppression impossible')
}
