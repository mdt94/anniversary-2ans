import crypto from 'crypto'
import { head, put } from '@vercel/blob'

const WIDGETS_PATH = 'memories/widgets.json'

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

export async function getWidgets() {
  const data = await readJson(WIDGETS_PATH, [])
  return Array.isArray(data) ? data : []
}

export async function saveWidgets(widgets) {
  try {
    await writeJson(WIDGETS_PATH, widgets)
  } catch (error) {
    throw formatBlobError(error)
  }
}

export function createWidgetId() {
  return crypto.randomUUID()
}
