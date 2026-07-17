import { useRelationshipDuration } from '../hooks/useRelationshipDuration'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { formatDuration } from '../utils/relationshipDuration'
import ScrollReveal from './ScrollReveal'

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/70 shadow-lg shadow-blush-200/50 backdrop-blur-sm sm:h-24 sm:w-24">
        <span className="font-display text-3xl font-semibold text-rose-gold sm:text-4xl">
          {String(value).padStart(2, '0')}
        </span>
        <div className="absolute inset-0 rounded-2xl ring-1 ring-blush-200/60" />
      </div>
      <span className="mt-2 text-xs font-medium uppercase tracking-widest text-dusty sm:text-sm">
        {label}
      </span>
    </div>
  )
}

export default function Hero() {
  const { startDate, partnerA, partnerB, siteTitle, startDateIso } =
    useSiteConfig()
  const { years, days } = useRelationshipDuration(startDate)
  const durationText = formatDuration({ years, days })
  const displayDate = startDateIso
    ? new Date(`${startDateIso}T12:00:00`).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : startDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20 text-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="animate-pulse-soft absolute -left-32 top-20 h-96 w-96 rounded-full bg-blush-200/50 blur-3xl" />
        <div className="animate-pulse-soft absolute -right-24 bottom-32 h-80 w-80 rounded-full bg-blush-100/70 blur-3xl [animation-delay:2s]" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blush-50/80 blur-2xl" />
      </div>

      <ScrollReveal className="relative z-10">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-blush-400">
          {displayDate}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={150} className="relative z-10">
        <h1 className="font-display text-4xl font-light leading-tight text-stone-800 sm:text-6xl md:text-7xl">
          {siteTitle || durationText}
          <span className="block bg-gradient-to-r from-blush-400 to-rose-gold bg-clip-text font-semibold italic text-transparent">
            {siteTitle ? `${partnerA} & ${partnerB}` : 'ensemble'}
          </span>
        </h1>
      </ScrollReveal>

      <ScrollReveal delay={300} className="relative z-10 mt-6 max-w-lg">
        <p className="text-lg leading-relaxed text-dusty sm:text-xl">
          Chaque instant à tes côtés est un chapitre de notre histoire — et
          ce n&apos;est que le début.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={450} className="relative z-10 mt-12">
        <p className="mb-6 text-sm uppercase tracking-widest text-dusty">
          Depuis notre premier jour
        </p>
        <div className="flex gap-4 sm:gap-8">
          <CountdownUnit value={years} label={years === 1 ? 'An' : 'Ans'} />
          <CountdownUnit value={days} label={days === 1 ? 'Jour' : 'Jours'} />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={600} className="relative z-10 mt-16 animate-float">
        <span className="animate-heartbeat inline-block text-3xl text-blush-400">
          ♥
        </span>
      </ScrollReveal>

      <a
        href="#timeline"
        aria-label="Défiler vers la suite"
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 animate-bounce text-dusty/60 transition-colors hover:text-blush-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </a>
    </section>
  )
}
