import { head, put } from '@vercel/blob'

const LETTERS_PATH = 'memories/letters.json'

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

function blobOptions(extra = {}) {
  return { access: 'public', ...extra }
}

function isBlobMissing(error) {
  const message = error?.message?.toLowerCase() ?? ''
  return (
    error?.name === 'BlobNotFoundError' ||
    error?.statusCode === 404 ||
    message.includes('not found') ||
    message.includes('does not exist')
  )
}

function isBlobAuthError(error) {
  const message = error?.message?.toLowerCase() ?? ''
  return (
    message.includes('no blob credentials') ||
    message.includes('no read-write token') ||
    message.includes('access denied') ||
    message.includes('store does not exist')
  )
}

function formatBlobError(error) {
  if (isBlobAuthError(error)) {
    return new Error(
      'Blob non connecté. Va dans Vercel → Storage → connecte le Blob Store au projet, puis Redeploy.',
    )
  }
  return error
}

export async function getLetters() {
  try {
    const blob = await head(LETTERS_PATH, blobOptions())
    const response = await fetch(blob.url)
    if (!response.ok) return DEFAULT_LETTERS

    const data = await response.json()
    const letters = Array.isArray(data) ? data : DEFAULT_LETTERS

    return letters.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    )
  } catch (error) {
    if (isBlobMissing(error)) return DEFAULT_LETTERS
    throw formatBlobError(error)
  }
}

export async function saveLetters(letters) {
  await put(LETTERS_PATH, JSON.stringify(letters), {
    ...blobOptions(),
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

export async function addLetter({ to, content }) {
  const letters = await getLetters()
  const letter = {
    id: crypto.randomUUID(),
    to,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  }

  letters.unshift(letter)
  await saveLetters(letters)
  return letter
}
