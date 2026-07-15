import { head, put } from '@vercel/blob'

const MEMORIES_PATH = 'memories/data.json'

function isBlobMissing(error) {
  return (
    error?.name === 'BlobNotFoundError' ||
    error?.statusCode === 404 ||
    error?.message?.toLowerCase().includes('not found')
  )
}

export async function getMemories() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return []

  try {
    const blob = await head(MEMORIES_PATH)
    const response = await fetch(blob.url)
    if (!response.ok) return []

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (isBlobMissing(error)) return []
    throw error
  }
}

export async function saveMemories(memories) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'Stockage non configuré. Active Vercel Blob dans ton projet.',
    )
  }

  await put(MEMORIES_PATH, JSON.stringify(memories), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

export async function uploadPhoto(id, name, base64Data) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'Stockage non configuré. Active Vercel Blob dans ton projet.',
    )
  }

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
