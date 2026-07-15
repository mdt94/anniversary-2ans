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
      'Vercel Blob non connecté. Storage → connecte un Blob Store → Redeploy.',
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
