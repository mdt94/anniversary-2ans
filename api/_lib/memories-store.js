import { list, put } from '@vercel/blob'

const MEMORIES_PATH = 'memories/data.json'

export async function getMemories() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return []

  try {
    const { blobs } = await list({ prefix: 'memories/', limit: 100 })
    const dataBlob = blobs.find((blob) => blob.pathname === MEMORIES_PATH)
    if (!dataBlob) return []

    const response = await fetch(dataBlob.url)
    if (!response.ok) return []

    return await response.json()
  } catch {
    return []
  }
}

export async function saveMemories(memories) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Stockage non configuré')
  }

  await put(MEMORIES_PATH, JSON.stringify(memories), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

export async function uploadPhoto(id, name, base64Data) {
  const buffer = Buffer.from(base64Data, 'base64')
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const pathname = `memories/photos/${id}-${safeName}`

  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType: guessContentType(safeName),
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  return blob.url
}

function guessContentType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  const types = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
  }
  return types[ext] ?? 'application/octet-stream'
}
