import { head, put } from '@vercel/blob'

const STATIC_PHOTOS_PATH = 'memories/static-photos.json'

function blobOptions(extra = {}) {
  return { access: 'public', ...extra }
}

function isBlobMissing(error) {
  const message = error?.message?.toLowerCase() ?? ''
  return (
    error?.name === 'BlobNotFoundError' ||
    error?.statusCode === 404 ||
    message.includes('not found') ||
    message.includes('does not exist')
  )
}

function isBlobAuthError(error) {
  const message = error?.message?.toLowerCase() ?? ''
  return (
    message.includes('no blob credentials') ||
    message.includes('no read-write token') ||
    message.includes('access denied') ||
    message.includes('store does not exist')
  )
}

function formatBlobError(error) {
  if (isBlobAuthError(error)) {
    return new Error(
      'Blob non connecté. Va dans Vercel → Storage → connecte le Blob Store au projet, puis Redeploy.',
    )
  }
  return error
}

export async function getStaticPhotos() {
  try {
    const blob = await head(STATIC_PHOTOS_PATH, blobOptions())
    const response = await fetch(blob.url)
    if (!response.ok) return {}

    const data = await response.json()
    return data && typeof data === 'object' ? data : {}
  } catch (error) {
    if (isBlobMissing(error)) return {}
    throw formatBlobError(error)
  }
}

export async function appendStaticPhotos(staticId, photoUrls = []) {
  const current = await getStaticPhotos()
  const existing = Array.isArray(current[staticId]) ? current[staticId] : []

  const next = {
    ...current,
    [staticId]: [...existing, ...photoUrls],
  }

  await put(STATIC_PHOTOS_PATH, JSON.stringify(next), {
    ...blobOptions(),
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  return next[staticId]
}
