import {
  clearStoredToken,
  getStoredToken,
  verifyPassword,
} from './memories'

const LETTERS_KEY = 'anniversary-letters'
const REQUEST_TIMEOUT_MS = 20_000

const DEFAULT_LETTERS = [
  {
    id: 'letter-welcome',
    to: 'Elma',
    content: `Mon amour,

Il y a deux ans, je ne savais pas que ma vie allait basculer si doucement. Depuis ce premier regard, chaque jour avec toi est une page que j'aimerais relire encore et encore.

Tu es ma lumière dans les jours gris, mon rire préféré, mon refuge. Merci pour ta patience, ta tendresse, et cette façon unique que tu as de rendre l'ordinaire extraordinaire.

Deux ans, c'est déjà tant de souvenirs — et pourtant, j'ai l'impression que notre histoire ne fait que commencer. Je t'aime plus qu'hier, un peu moins que demain.

Pour toujours,
Avec tout mon cœur ♥`,
    createdAt: '2024-06-21T21:00:00.000Z',
  },
]

function isLocalMode() {
  return import.meta.env.DEV && !import.meta.env.VITE_USE_API
}

function readLocalLetters() {
  try {
    const letters = JSON.parse(localStorage.getItem(LETTERS_KEY) ?? 'null')
    return Array.isArray(letters) ? letters : DEFAULT_LETTERS
  } catch {
    return DEFAULT_LETTERS
  }
}

function writeLocalLetters(letters) {
  localStorage.setItem(LETTERS_KEY, JSON.stringify(letters))
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Le serveur met trop de temps à répondre.')
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

export { getStoredToken, clearStoredToken, verifyPassword }

export async function fetchLetters() {
  if (isLocalMode()) {
    return readLocalLetters().sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    )
  }

  const response = await fetchWithTimeout('/api/letters')
  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data.error ?? 'Impossible de charger les lettres')
  }

  return data
}

export async function createLetter({ to, content }) {
  if (isLocalMode()) {
    const letter = {
      id: crypto.randomUUID(),
      to,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }

    const letters = readLocalLetters()
    letters.unshift(letter)
    writeLocalLetters(letters)
    return letter
  }

  const token = getStoredToken()
  const response = await fetchWithTimeout('/api/letters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ to, content }),
  })

  const data = await parseJsonResponse(response)
  if (!response.ok) {
    throw new Error(data.error ?? 'Erreur lors de l\'enregistrement')
  }

  return data
}
