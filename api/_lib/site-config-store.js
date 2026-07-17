import crypto from 'crypto'
import { head, put } from '@vercel/blob'

const CONFIG_PATH = 'memories/site-config.json'

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

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPasswordHash(password, stored) {
  if (!password || !stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const next = crypto.scryptSync(password, salt, 64).toString('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(next, 'hex'))
  } catch {
    return false
  }
}

export function createSetupToken() {
  return crypto.randomBytes(24).toString('hex')
}

const EMPTY_CONFIG = {
  setupComplete: false,
  passwordHash: null,
  setupToken: null,
  partnerA: '',
  partnerB: '',
  startDate: '',
  siteTitle: '',
  currency: 'eur',
  orderId: null,
  createdAt: null,
  updatedAt: null,
}

export async function getSiteConfig() {
  return readJson(CONFIG_PATH, { ...EMPTY_CONFIG })
}

export async function saveSiteConfig(config) {
  try {
    await writeJson(CONFIG_PATH, {
      ...EMPTY_CONFIG,
      ...config,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    throw formatBlobError(error)
  }
}

export function publicSiteConfig(config) {
  return {
    setupComplete: Boolean(config.setupComplete),
    needsSetup: !config.setupComplete,
    partnerA: config.partnerA || '',
    partnerB: config.partnerB || '',
    startDate: config.startDate || '',
    siteTitle: config.siteTitle || '',
  }
}
