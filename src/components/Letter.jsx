import { useState } from 'react'
import ScrollReveal from './ScrollReveal'

const LETTER_TEXT = `Mon amour,

Il y a deux ans, je ne savais pas que ma vie allait basculer si doucement. Depuis ce premier regard, chaque jour avec toi est une page que j'aimerais relire encore et encore.

Tu es ma lumière dans les jours gris, mon rire préféré, mon refuge. Merci pour ta patience, ta tendresse, et cette façon unique que tu as de rendre l'ordinaire extraordinaire.

Deux ans, c'est déjà tant de souvenirs — et pourtant, j'ai l'impression que notre histoire ne fait que commencer. Je t'aime plus qu'hier, un peu moins que demain.

Pour toujours,
Avec tout mon cœur ♥`

export default function Letter() {
  const [revealed, setRevealed] = useState(false)

  return (
    <section id="letter" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl">
        <ScrollReveal className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blush-400">
            Pour toi
          </p>
          <h2 className="mt-3 font-display text-4xl font-light text-stone-800 sm:text-5xl">
            Une{' '}
            <span className="font-semibold italic text-rose-gold">lettre</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="relative overflow-hidden rounded-3xl bg-white/70 p-8 shadow-xl shadow-blush-200/30 backdrop-blur-sm sm:p-12">
            {/* Decorative envelope flap */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-px left-0 right-0 h-16 bg-gradient-to-b from-blush-100/80 to-transparent"
            />

            {!revealed ? (
              <div className="flex flex-col items-center py-12">
                <div className="mb-8 text-5xl opacity-60">💌</div>
                <p className="mb-8 max-w-sm text-center text-dusty">
                  Quelque chose de spécial t&apos;attend… Clique pour ouvrir
                  ton message.
                </p>
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blush-400 to-rose-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-blush-300/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blush-300/50 active:scale-95"
                >
                  <span className="relative z-10">Révéler la lettre</span>
                  <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                </button>
              </div>
            ) : (
              <div className="animate-fade-in-letter">
                <div className="whitespace-pre-line font-display text-lg leading-loose text-stone-700 sm:text-xl">
                  {LETTER_TEXT}
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
