import { head, put } from '@vercel/blob'

const MEMORIES_PATH = 'memories/data.json'

function blobOptions(extra = {}) {
  const options = { access: 'public', ...extra }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    options.token = process.env.BLOB_READ_WRITE_TOKEN
  }

  return options
}

function isBlobMissing(error) {
  return (
    error?.name === 'BlobNotFoundError' ||
    error?.statusCode === 404 ||
    error?.message?.toLowerCase().includes('not found')
  )
}

function isBlobAuthError(error) {
  const message = error?.message?.toLowerCase() ?? ''
  return (
    message.includes('no blob credentials') ||
    message.includes('no read-write token') ||
    message.includes('access denied')
  )
}

function formatBlobError(error) {
  if (isBlobAuthError(error)) {
    return new Error(
      'Stockage Blob non connecté. Va dans Vercel → Storage → connecte un Blob Store, puis Redeploy.',
    )
  }
  return error
}

export async function getMemories() {
  try {
    const blob = await head(MEMORIES_PATH, blobOptions())
    const response = await fetch(blob.url)
    if (!response.ok) return []

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (isBlobMissing(error)) return []
    throw formatBlobError(error)
  }
}

export async function saveMemories(memories) {
  try {
    await put(MEMORIES_PATH, JSON.stringify(memories), {
      ...blobOptions(),
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
  } catch (error) {
    throw formatBlobError(error)
  }
}

export async function uploadPhoto(id, name, base64Data) {
  const buffer = Buffer.from(base64Data, 'base64')
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const pathname = `memories/photos/${id}-${safeName}`

  try {
    const blob = await put(pathname, buffer, {
      ...blobOptions(),
      contentType: guessContentType(safeName),
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    return blob.url
  } catch (error) {
    throw formatBlobError(error)
  }
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
