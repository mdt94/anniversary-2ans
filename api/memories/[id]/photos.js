import { verifyToken } from '../_lib/auth.js'
import { methodNotAllowed, sendJson } from '../_lib/http.js'
import { getMemories, saveMemories } from '../_lib/memories-store.js'
import { appendStaticPhotos } from '../_lib/static-photos-store.js'

function getMemoryId(req) {
  const id = req.query?.id
  return Array.isArray(id) ? id[0] : id
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res)
  }

  const id = getMemoryId(req)
  if (!id) {
    return sendJson(res, 400, { error: 'Identifiant manquant' })
  }

  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (!verifyToken(token)) {
    return sendJson(res, 401, {
      error: 'Session expirée. Reconnecte-toi avec le mot de passe.',
    })
  }

  try {
    const { photoUrls = [] } = req.body ?? {}
    const urls = Array.isArray(photoUrls) ? photoUrls.filter(Boolean) : []

    if (urls.length === 0) {
      return sendJson(res, 400, { error: 'Aucune photo à ajouter' })
    }

    if (id.startsWith('static-')) {
      const photos = await appendStaticPhotos(id, urls)
      return sendJson(res, 200, { id, photos })
    }

    const memories = await getMemories()
    const index = memories.findIndex((memory) => memory.id === id)

    if (index === -1) {
      return sendJson(res, 404, { error: 'Souvenir introuvable' })
    }

    const updated = {
      ...memories[index],
      photos: [...(memories[index].photos ?? []), ...urls],
      updatedAt: new Date().toISOString(),
    }

    memories[index] = updated
    await saveMemories(memories)

    return sendJson(res, 200, updated)
  } catch (error) {
    console.error(`POST /api/memories/${id}/photos failed:`, error)
    return sendJson(res, 500, {
      error: error.message ?? 'Erreur lors de l\'ajout des photos',
    })
  }
}
