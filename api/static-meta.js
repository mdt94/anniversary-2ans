import { verifyToken } from './_lib/auth.js'
import { methodNotAllowed, sendJson } from './_lib/http.js'
import { getStaticMeta, saveStaticMeta } from './_lib/static-meta-store.js'

function getBearerToken(req) {
  const header = req.headers.authorization || ''
  const [type, token] = header.split(' ')
  return type === 'Bearer' ? token : null
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const meta = await getStaticMeta()
      return sendJson(res, 200, meta)
    } catch (error) {
      return sendJson(res, 500, { error: error.message })
    }
  }

  if (req.method === 'PUT') {
    const token = getBearerToken(req)
    if (!verifyToken(token)) {
      return sendJson(res, 401, {
        error: 'Session expirée. Reconnecte-toi avec le mot de passe.',
      })
    }

    try {
      const { id, title } = req.body ?? {}
      if (!id?.startsWith('static-')) {
        return sendJson(res, 400, { error: 'Souvenir statique invalide' })
      }
      if (!title?.trim()) {
        return sendJson(res, 400, { error: 'Le nom du souvenir est obligatoire' })
      }

      const meta = await getStaticMeta()
      meta[id] = {
        ...(meta[id] || {}),
        title: title.trim(),
        updatedAt: new Date().toISOString(),
      }
      await saveStaticMeta(meta)

      return sendJson(res, 200, { id, title: title.trim(), meta: meta[id] })
    } catch (error) {
      return sendJson(res, 500, { error: error.message })
    }
  }

  return methodNotAllowed(res)
}
