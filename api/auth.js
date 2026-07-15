import { createToken, verifyPassword } from './_lib/auth.js'
import { methodNotAllowed, sendJson } from './_lib/http.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res)
  }

  try {
    const { password } = req.body ?? {}

    if (!verifyPassword(password)) {
      return sendJson(res, 401, { error: 'Mot de passe incorrect' })
    }

    const token = createToken()
    if (!token) {
      return sendJson(res, 500, {
        error:
          'Configuration incomplète. Ajoute ADMIN_PASSWORD et ADMIN_SECRET sur Vercel.',
      })
    }

    return sendJson(res, 200, { token })
  } catch {
    return sendJson(res, 400, { error: 'Requête invalide' })
  }
}
