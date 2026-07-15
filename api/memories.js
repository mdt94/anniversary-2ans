import { verifyToken } from './_lib/auth.js'
import { getMemories, saveMemories, uploadPhoto } from './_lib/memories-store.js'

export default async function handler(request) {
  if (request.method === 'GET') {
    const memories = await getMemories()
    return Response.json(memories)
  }

  if (request.method === 'POST') {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!verifyToken(token)) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    try {
      const { title, date, photos = [] } = await request.json()

      if (!title?.trim() || !date) {
        return Response.json(
          { error: 'Le nom et la date sont obligatoires' },
          { status: 400 },
        )
      }

      const id = crypto.randomUUID()
      const photoUrls = []

      for (const photo of photos) {
        if (!photo?.data || !photo?.name) continue
        const url = await uploadPhoto(id, photo.name, photo.data)
        photoUrls.push(url)
      }

      const memory = {
        id,
        title: title.trim(),
        date,
        photos: photoUrls,
        createdAt: new Date().toISOString(),
        custom: true,
      }

      const memories = await getMemories()
      memories.push(memory)
      await saveMemories(memories)

      return Response.json(memory, { status: 201 })
    } catch (error) {
      return Response.json(
        { error: error.message ?? 'Erreur lors de la sauvegarde' },
        { status: 500 },
      )
    }
  }

  return Response.json({ error: 'Méthode non autorisée' }, { status: 405 })
}
