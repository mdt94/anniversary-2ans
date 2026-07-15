import { methodNotAllowed, sendJson } from '../_lib/http.js'
import { getStaticPhotos } from '../_lib/static-photos-store.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res)
  }

  try {
    const staticPhotos = await getStaticPhotos()
    return sendJson(res, 200, staticPhotos)
  } catch (error) {
    console.error('GET /api/static-photos failed:', error)
    return sendJson(res, 500, {
      error: error.message ?? 'Impossible de charger les photos',
    })
  }
}
