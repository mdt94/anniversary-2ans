import { createToken, verifyPassword } from './_lib/auth.js'

export default async function handler(request) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Méthode non autorisée' }, { status: 405 })
  }

  try {
    const { password } = await request.json()

    if (!verifyPassword(password)) {
      return Response.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }

    const token = createToken()
    if (!token) {
      return Response.json(
        { error: 'Configuration serveur incomplète' },
        { status: 500 },
      )
    }

    return Response.json({ token })
  } catch {
    return Response.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
