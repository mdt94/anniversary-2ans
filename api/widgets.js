import { verifyToken } from './_lib/auth.js'
import { methodNotAllowed, sendJson } from './_lib/http.js'
import {
  createWidgetId,
  getWidgets,
  saveWidgets,
} from './_lib/widgets-store.js'

function getBearerToken(req) {
  const header = req.headers.authorization || ''
  const [type, token] = header.split(' ')
  return type === 'Bearer' ? token : null
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const widgets = await getWidgets()
      return sendJson(res, 200, { widgets })
    } catch (error) {
      return sendJson(res, 500, { error: error.message })
    }
  }

  if (req.method === 'POST') {
    const token = getBearerToken(req)
    if (!verifyToken(token)) {
      return sendJson(res, 401, { error: 'Session expirée. Reconnectez-vous.' })
    }

    try {
      const { title, caption, date, photos = [], accent = 'blush' } = req.body ?? {}

      if (!title?.trim()) {
        return sendJson(res, 400, { error: 'Le titre du widget est requis.' })
      }

      if (!date) {
        return sendJson(res, 400, { error: 'La date du souvenir est requise.' })
      }

      const widgets = await getWidgets()
      const widget = {
        id: createWidgetId(),
        title: title.trim(),
        caption: (caption || '').trim(),
        date,
        photos: Array.isArray(photos) ? photos.slice(0, 6) : [],
        accent,
        createdAt: new Date().toISOString(),
      }

      widgets.unshift(widget)
      await saveWidgets(widgets)

      return sendJson(res, 201, { widget })
    } catch (error) {
      return sendJson(res, 500, { error: error.message })
    }
  }

  if (req.method === 'DELETE') {
    const token = getBearerToken(req)
    if (!verifyToken(token)) {
      return sendJson(res, 401, { error: 'Session expirée. Reconnectez-vous.' })
    }

    try {
      const id = req.query?.id || req.body?.id
      if (!id) {
        return sendJson(res, 400, { error: 'Identifiant manquant.' })
      }

      const widgets = await getWidgets()
      await saveWidgets(widgets.filter((widget) => widget.id !== id))
      return sendJson(res, 200, { ok: true })
    } catch (error) {
      return sendJson(res, 500, { error: error.message })
    }
  }

  return methodNotAllowed(res)
}
