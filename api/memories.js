import { verifyToken } from './_lib/auth.js'
import { methodNotAllowed, sendJson } from './_lib/http.js'
import { getMemories, saveMemories } from './_lib/memories-store.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const memories = await getMemories()
      return sendJson(res, 200, memories)
    } catch (error) {
      console.error('GET /api/memories failed:', error)
      return sendJson(res, 500, {
        error: error.message ?? 'Impossible de charger les souvenirs',
      })
    }
  }

  if (req.method === 'POST') {
    const authHeader = req.headers.authorization ?? ''
    const token = authHeader.replace(/^Bearer\s+/i, '')

    if (!verifyToken(token)) {
      return sendJson(res, 401, {
        error: 'Session expirée. Reconnecte-toi avec le mot de passe.',
      })
    }

    try {
      const { title, date, photoUrls = [] } = req.body ?? {}

      if (!title?.trim() || !date) {
        return sendJson(res, 400, {
          error: 'Le nom et la date sont obligatoires',
        })
      }

      const memory = {
        id: crypto.randomUUID(),
        title: title.trim(),
        date,
        photos: Array.isArray(photoUrls) ? photoUrls : [],
        createdAt: new Date().toISOString(),
        custom: true,
      }

      const memories = await getMemories()
      memories.push(memory)
      await saveMemories(memories)

      return sendJson(res, 201, memory)
    } catch (error) {
      console.error('POST /api/memories failed:', error)
      return sendJson(res, 500, {
        error: error.message ?? 'Erreur lors de la sauvegarde',
      })
    }
  }

  return methodNotAllowed(res)
}
