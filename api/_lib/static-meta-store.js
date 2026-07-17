import { head, put } from '@vercel/blob'

const META_PATH = 'memories/static-meta.json'

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

async function readJson(path, fallback) {
  try {
    const blob = await head(path, blobOptions())
    const response = await fetch(blob.url)
    if (!response.ok) return fallback
    return await response.json()
  } catch (error) {
    if (isBlobMissing(error)) return fallback
    throw formatBlobError(error)
  }
}

async function writeJson(path, data) {
  await put(path, JSON.stringify(data), {
    ...blobOptions(),
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

export async function getStaticMeta() {
  const data = await readJson(META_PATH, {})
  return data && typeof data === 'object' ? data : {}
}

export async function saveStaticMeta(meta) {
  try {
    await writeJson(META_PATH, meta)
  } catch (error) {
    throw formatBlobError(error)
  }
}
