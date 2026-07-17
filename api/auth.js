import { createToken, verifyEnvPassword } from './_lib/auth.js'
import { methodNotAllowed, sendJson } from './_lib/http.js'
import {
  getSiteConfig,
  verifyPasswordHash,
} from './_lib/site-config-store.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res)
  }

  try {
    const { password } = req.body ?? {}

    if (!password) {
      return sendJson(res, 401, { error: 'Mot de passe incorrect' })
    }

    let ok = verifyEnvPassword(password)

    if (!ok) {
      try {
        const config = await getSiteConfig()
        if (config.setupComplete && config.passwordHash) {
          ok = verifyPasswordHash(password, config.passwordHash)
        }
      } catch {
        // Blob unavailable — fall through to env-only
      }
    }

    if (!ok) {
      return sendJson(res, 401, { error: 'Mot de passe incorrect' })
    }

    const token = createToken()
    if (!token) {
      return sendJson(res, 500, {
        error:
          'Configuration incomplète. Ajoute ADMIN_SECRET sur Vercel.',
      })
    }

    return sendJson(res, 200, { token })
  } catch {
    return sendJson(res, 400, { error: 'Requête invalide' })
  }
}
