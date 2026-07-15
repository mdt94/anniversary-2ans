import crypto from 'crypto'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000

export function verifyPassword(password) {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
      password === process.env.ADMIN_PASSWORD,
  )
}

export function createToken() {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return null

  const payload = JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS })
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return Buffer.from(`${payload}.${signature}`).toString('base64url')
}

export function verifyToken(token) {
  const secret = process.env.ADMIN_SECRET
  if (!secret || !token) return false

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const separator = decoded.lastIndexOf('.')
    if (separator === -1) return false

    const payload = decoded.slice(0, separator)
    const signature = decoded.slice(separator + 1)

    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    if (signature !== expected) return false

    const { exp } = JSON.parse(payload)
    return Date.now() < exp
  } catch {
    return false
  }
}
