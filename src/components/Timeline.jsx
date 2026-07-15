import { useMemo, useState } from 'react'
import AddMemoryModal from './AddMemoryModal'
import ScrollReveal from './ScrollReveal'
import { useMemories } from '../hooks/useMemories'

const STATIC_STEPS = [
  {
    id: 'static-meeting',
    sortDate: '2024-06-21',
    date: '21 juin 2024',
    title: 'Notre rencontre',
    description:
      'Le soir où nos regards se sont croisés à 21h, et où tout a commencé, comme dans un film dont on ne voulait pas que la fin arrive.',
    gradient: 'from-blush-200 via-blush-100 to-cream',
    icon: '✨',
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
  },
]

function formatDisplayDate(isoDate) {
  const parsed = new Date(`${isoDate}T12:00:00`)
  return parsed.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function normalizeCustomMemory(memory) {
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

function TimelineStep({ step, index }) {
  const isEven = index % 2 === 0
  const variant = isEven ? 'left' : 'right'
  const hasPhotos = step.photos?.length > 0

  return (
    <div className="relative flex flex-col items-center md:flex-row md:even:flex-row-reverse">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-8 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-cream bg-blush-400 shadow-md md:block"
      />

      <ScrollReveal
        variant={variant}
        delay={index * 120}
        className="w-full md:w-[calc(50%-2rem)]"
      >
        <div className="group rounded-2xl bg-white/60 p-6 shadow-md shadow-blush-100/50 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-blush-200/40">
          <span className="text-2xl">{step.icon}</span>
          <p className="mt-2 text-xs font-medium uppercase tracking-widest text-blush-400">
            {step.date}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-stone-800">
            {step.title}
          </h3>
          {step.description && (
            <p className="mt-3 leading-relaxed text-dusty">{step.description}</p>
          )}
        </div>
      </ScrollReveal>

      <ScrollReveal
        variant={isEven ? 'right' : 'left'}
        delay={index * 120 + 80}
        className="mt-6 w-full md:mt-0 md:w-[calc(50%-2rem)]"
      >
        {hasPhotos ? (
          <div
            className={`mx-auto grid max-w-sm gap-3 md:mx-0 ${
              step.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            {step.photos.map((photo, photoIndex) => (
              <div
                key={`${step.id}-photo-${photoIndex}`}
                className="overflow-hidden rounded-2xl shadow-lg shadow-blush-200/30"
              >
                <img
                  src={photo}
                  alt={`${step.title} - photo ${photoIndex + 1}`}
                  className="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`mx-auto aspect-[4/3] max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg shadow-blush-200/30 transition-transform duration-500 group-hover:scale-[1.02] md:mx-0`}
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 text-dusty/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">Votre photo ici</span>
            </div>
          </div>
        )}
      </ScrollReveal>
    </div>
  )
}

export default function Timeline() {
  const [modalOpen, setModalOpen] = useState(false)
  const { memories, addMemory } = useMemories()

  const steps = useMemo(() => {
    const customSteps = memories.map(normalizeCustomMemory)
    return [...STATIC_STEPS, ...customSteps].sort((a, b) =>
      a.sortDate.localeCompare(b.sortDate),
    )
  }, [memories])

  return (
    <section id="timeline" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="mb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blush-400">
            Notre histoire
          </p>
          <h2 className="mt-3 font-display text-4xl font-light text-stone-800 sm:text-5xl">
            Une frise du{' '}
            <span className="font-semibold italic text-rose-gold">cœur</span>
          </h2>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white/70 px-5 py-2.5 text-sm font-medium text-dusty shadow-sm transition hover:border-blush-300 hover:text-blush-500"
          >
            <span aria-hidden="true">🔒</span>
            Ajouter un souvenir
          </button>
        </ScrollReveal>

        <div className="relative space-y-16 md:space-y-24">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-blush-200 via-blush-300 to-blush-200 md:block"
          />

          {steps.map((step, index) => (
            <TimelineStep key={step.id} step={step} index={index} />
          ))}
        </div>
      </div>

      <AddMemoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={addMemory}
      />
    </section>
  )
}
