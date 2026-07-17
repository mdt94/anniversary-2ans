import { createToken } from './_lib/auth.js'
import { methodNotAllowed, sendJson } from './_lib/http.js'
import {
  getSiteConfig,
  hashPassword,
  publicSiteConfig,
  saveSiteConfig,
} from './_lib/site-config-store.js'
import {
  findOrderBySetupToken,
  markOrderSetupComplete,
} from './_lib/orders-store.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const config = await getSiteConfig()
      const envFallback = Boolean(process.env.ADMIN_PASSWORD)
      return sendJson(res, 200, {
        ...publicSiteConfig(config),
        needsSetup: !config.setupComplete && !envFallback,
        hasEnvPassword: envFallback,
      })
    } catch (error) {
      return sendJson(res, 500, { error: error.message })
    }
  }

  if (req.method !== 'POST') {
    return methodNotAllowed(res)
  }

  try {
    const {
      password,
      confirmPassword,
      partnerA,
      partnerB,
      startDate,
      siteTitle,
      setupToken,
    } = req.body ?? {}

    if (!password || password.length < 6) {
      return sendJson(res, 400, {
        error: 'Le mot de passe doit contenir au moins 6 caractères.',
      })
    }

    if (password !== confirmPassword) {
      return sendJson(res, 400, {
        error: 'Les mots de passe ne correspondent pas.',
      })
    }

    if (!partnerA?.trim() || !partnerB?.trim()) {
      return sendJson(res, 400, {
        error: 'Indiquez les deux prénoms du couple.',
      })
    }

    if (!startDate) {
      return sendJson(res, 400, {
        error: 'Indiquez la date de début de votre histoire.',
      })
    }

    const config = await getSiteConfig()
    const envFallback = Boolean(process.env.ADMIN_PASSWORD)

    if (config.setupComplete || envFallback) {
      return sendJson(res, 409, {
        error:
          'Le site est déjà configuré. Connectez-vous avec votre mot de passe.',
      })
    }

    const order = setupToken ? await findOrderBySetupToken(setupToken) : null
    const tokenOk =
      (config.setupToken && setupToken === config.setupToken) ||
      (order && order.status === 'paid' && !order.setupComplete)

    // Allow open setup only when no purchase token was issued yet (local / first deploy)
    const openSetupAllowed = !config.setupToken && !setupToken

    if (!tokenOk && !openSetupAllowed) {
      return sendJson(res, 403, {
        error: 'Lien d’activation invalide ou déjà utilisé.',
      })
    }

    if (order) {
      await markOrderSetupComplete(order.id)
    }

    const title =
      siteTitle?.trim() || `${partnerA.trim()} & ${partnerB.trim()}`

    await saveSiteConfig({
      ...config,
      setupComplete: true,
      passwordHash: hashPassword(password),
      partnerA: partnerA.trim(),
      partnerB: partnerB.trim(),
      startDate,
      siteTitle: title,
      setupToken: null,
      orderId: order?.id || config.orderId || null,
      createdAt: config.createdAt || new Date().toISOString(),
    })

    const token = createToken()
    return sendJson(res, 200, {
      ok: true,
      token,
      config: publicSiteConfig({
        setupComplete: true,
        partnerA: partnerA.trim(),
        partnerB: partnerB.trim(),
        startDate,
        siteTitle: title,
      }),
    })
  } catch (error) {
    return sendJson(res, 500, {
      error: error.message || 'Erreur de configuration',
    })
  }
}
