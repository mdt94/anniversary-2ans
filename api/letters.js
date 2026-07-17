import { verifyToken } from './_lib/auth.js'
import { addLetter, getLetters } from './_lib/letters-store.js'
import { methodNotAllowed, sendJson } from './_lib/http.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const letters = await getLetters()
      return sendJson(res, 200, letters)
    } catch (error) {
      console.error('GET /api/letters failed:', error)
      return sendJson(res, 500, {
        error: error.message ?? 'Impossible de charger les lettres',
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
      const { to, content } = req.body ?? {}

      if (!to?.trim()) {
        return sendJson(res, 400, {
          error: 'Choisis un destinataire',
        })
      }

      if (!content?.trim()) {
        return sendJson(res, 400, { error: 'La lettre ne peut pas être vide' })
      }

      const letter = await addLetter({ to: to.trim(), content })
      return sendJson(res, 201, letter)
    } catch (error) {
      console.error('POST /api/letters failed:', error)
      return sendJson(res, 500, {
        error: error.message ?? 'Erreur lors de l\'enregistrement',
      })
    }
  }

  return methodNotAllowed(res)
}
