import { handleUpload } from '@vercel/blob/client'
import { verifyToken } from './_lib/auth.js'
import { methodNotAllowed, sendJson } from './_lib/http.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res)
  }

  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (!verifyToken(token)) {
    return sendJson(res, 401, { error: 'Session expirée. Reconnecte-toi.' })
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
        ],
        maximumSizeInBytes: 5_000_000,
        validUntil: Date.now() + 10 * 60 * 1000,
        addRandomSuffix: true,
      }),
    })

    return sendJson(res, 200, jsonResponse)
  } catch (error) {
    console.error('POST /api/upload failed:', error)
    return sendJson(res, 400, {
      error:
        error.message ??
        'Upload impossible. Vérifie que Vercel Blob est connecté puis redeploy.',
    })
  }
}
