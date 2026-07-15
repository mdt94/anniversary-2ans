import { del } from '@vercel/blob'
import { verifyToken } from '../_lib/auth.js'
import { methodNotAllowed, sendJson } from '../_lib/http.js'
import { getMemories, saveMemories } from '../_lib/memories-store.js'

function getMemoryId(req) {
  const id = req.query?.id
  return Array.isArray(id) ? id[0] : id
}

function requireAuth(req, res) {
  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (!verifyToken(token)) {
    sendJson(res, 401, {
      error: 'Session expirée. Reconnecte-toi avec le mot de passe.',
    })
    return false
  }

  return true
}

async function deletePhotos(photos = []) {
  const urls = photos.filter(Boolean)
  if (urls.length === 0) return

  try {
    await del(urls)
  } catch (error) {
    console.error('Photo cleanup failed:', error)
  }
}

export default async function handler(req, res) {
  const id = getMemoryId(req)
  if (!id) {
    return sendJson(res, 400, { error: 'Identifiant manquant' })
  }

  if (req.method === 'PUT') {
    if (!requireAuth(req, res)) return

    try {
      const { title, date, photoUrls = [] } = req.body ?? {}

      if (!title?.trim() || !date) {
        return sendJson(res, 400, {
          error: 'Le nom et la date sont obligatoires',
        })
      }

      const memories = await getMemories()
      const index = memories.findIndex((memory) => memory.id === id)

      if (index === -1) {
        return sendJson(res, 404, { error: 'Souvenir introuvable' })
      }

      const previous = memories[index]
      const nextPhotos = Array.isArray(photoUrls) ? photoUrls : []
      const removedPhotos = (previous.photos ?? []).filter(
        (photo) => !nextPhotos.includes(photo),
      )

      const updated = {
        ...previous,
        title: title.trim(),
        date,
        photos: nextPhotos,
        updatedAt: new Date().toISOString(),
      }

      memories[index] = updated
      await saveMemories(memories)
      await deletePhotos(removedPhotos)

      return sendJson(res, 200, updated)
    } catch (error) {
      console.error(`PUT /api/memories/${id} failed:`, error)
      return sendJson(res, 500, {
        error: error.message ?? 'Erreur lors de la modification',
      })
    }
  }

  if (req.method === 'DELETE') {
    if (!requireAuth(req, res)) return

    try {
      const memories = await getMemories()
      const index = memories.findIndex((memory) => memory.id === id)

      if (index === -1) {
        return sendJson(res, 404, { error: 'Souvenir introuvable' })
      }

      const [removed] = memories.splice(index, 1)
      await saveMemories(memories)
      await deletePhotos(removed.photos)

      return sendJson(res, 200, { ok: true })
    } catch (error) {
      console.error(`DELETE /api/memories/${id} failed:`, error)
      return sendJson(res, 500, {
        error: error.message ?? 'Erreur lors de la suppression',
      })
    }
  }

  return methodNotAllowed(res)
}
