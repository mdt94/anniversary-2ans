export const STATIC_STEPS = [
  {
    id: 'static-meeting',
    sortDate: '2024-06-21',
    date: '21 juin 2024',
    title: 'Notre rencontre',
    description:
      'Le soir où nos regards se sont croisés à 21h, et où tout a commencé, comme dans un film dont on ne voulait pas que la fin arrive.',
    gradient: 'from-blush-200 via-blush-100 to-cream',
    icon: '✨',
    photos: [],
    custom: false,
  },
  {
    id: 'static-trip',
    sortDate: '2024-09-01',
    date: 'Septembre 2024',
    title: 'Premier voyage',
    description:
      'Nos valises pleines de rêves, des routes inconnues et des souvenirs gravés pour toujours dans nos cœurs.',
    gradient: 'from-rose-100 via-blush-50 to-cream',
    icon: '🌸',
    photos: [],
    custom: false,
  },
  {
    id: 'static-one-year',
    sortDate: '2025-06-21',
    date: '21 juin 2025',
    title: 'Un an déjà',
    description:
      "365 jours de rires, de complicité et de moments magiques. Une première bougie sur notre gâteau d'amour.",
    gradient: 'from-blush-300/40 via-blush-100 to-cream',
    icon: '🎂',
    photos: [],
    custom: false,
  },
  {
    id: 'static-two-years',
    sortDate: '2026-06-21',
    date: '21 juin 2026',
    title: 'Deux ans ensemble',
    description:
      'Deux années de bonheur partagé — et chaque jour qui suit est un nouveau chapitre. La plus belle aventure continue…',
    gradient: 'from-rose-gold/30 via-blush-100 to-cream',
    icon: '💕',
    photos: [],
    custom: false,
  },
]

export function formatDisplayDate(isoDate) {
  const parsed = new Date(`${isoDate}T12:00:00`)
  return parsed.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function normalizeCustomMemory(memory) {
  return {
    id: memory.id,
    sortDate: memory.date,
    date: formatDisplayDate(memory.date),
    title: memory.title,
    description: null,
    gradient: 'from-blush-100 via-rose-100 to-cream',
    icon: '💌',
    photos: memory.photos ?? [],
    custom: true,
  }
}

export function buildTimelineSteps(memories, staticPhotos = {}, staticTitles = {}) {
  const staticWithPhotos = STATIC_STEPS.map((step) => ({
    ...step,
    title: staticTitles[step.id] || step.title,
    photos: staticPhotos[step.id] ?? [],
  }))
  const customSteps = memories.map(normalizeCustomMemory)
  return [...staticWithPhotos, ...customSteps].sort((a, b) =>
    a.sortDate.localeCompare(b.sortDate),
  )
}
