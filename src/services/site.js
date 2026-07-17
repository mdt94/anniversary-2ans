const TOKEN_KEY = 'anniversary-admin-token'
const CONFIG_KEY = 'anniversary-site-config'
const REQUEST_TIMEOUT_MS = 20_000

function isLocalMode() {
  return import.meta.env.DEV && !import.meta.env.VITE_USE_API
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'Le serveur met trop de temps à répondre. Vérifie la configuration Vercel.',
      )
    }
    throw new Error('Impossible de contacter le serveur.')
  } finally {
    clearTimeout(timeout)
  }
}

async function parseJsonResponse(response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Réponse serveur invalide.')
  }
}

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export function getLocalSiteConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY) ?? 'null')
  } catch {
    return null
  }
}

export function saveLocalSiteConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export async function fetchSetupStatus() {
  if (isLocalMode()) {
    const config = getLocalSiteConfig()
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD
    return {
      setupComplete: Boolean(config?.setupComplete) || Boolean(envPassword),
      needsSetup: !config?.setupComplete && !envPassword,
      partnerA: config?.partnerA || '',
      partnerB: config?.partnerB || '',
      startDate: config?.startDate || '',
      siteTitle: config?.siteTitle || '',
      hasEnvPassword: Boolean(envPassword),
    }
  }

  const response = await fetchWithTimeout('/api/setup')
  const data = await parseJsonResponse(response)
  if (!response.ok) throw new Error(data.error || 'Impossible de charger le setup')
  return data
}

export async function completeSetup(payload) {
  if (isLocalMode()) {
    if (payload.password !== payload.confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas.')
    }
    if (!payload.password || payload.password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères.')
    }

    const config = {
      setupComplete: true,
      partnerA: payload.partnerA.trim(),
      partnerB: payload.partnerB.trim(),
      startDate: payload.startDate,
      siteTitle:
        payload.siteTitle?.trim() ||
        `${payload.partnerA.trim()} & ${payload.partnerB.trim()}`,
      localPassword: payload.password,
    }
    saveLocalSiteConfig(config)
    setStoredToken('local-dev-token')
    return { ok: true, token: 'local-dev-token', config }
  }

  const response = await fetchWithTimeout('/api/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseJsonResponse(response)
  if (!response.ok) throw new Error(data.error || 'Configuration impossible')
  if (data.token) setStoredToken(data.token)
  return data
}
