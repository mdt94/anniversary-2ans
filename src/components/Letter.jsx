import { useEffect, useState } from 'react'
import ScrollReveal from './ScrollReveal'
import { useLetters } from '../hooks/useLetters'
import { useSiteConfig } from '../hooks/useSiteConfig'
import {
  clearStoredToken,
  createLetter,
  getStoredToken,
  verifyPassword,
} from '../services/letters'

function formatLetterDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function LetterCard({ letter }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-blush-100 bg-white/70 p-6 shadow-md shadow-blush-100/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-blush-400">
            Pour {letter.to}
          </p>
          <p className="mt-1 text-sm text-dusty">
            {formatLetterDate(letter.createdAt)}
          </p>
        </div>
        <span className="text-2xl">💌</span>
      </div>

      <div
        className={`mt-4 whitespace-pre-line font-display leading-relaxed text-stone-700 transition-all ${
          open ? 'text-lg' : 'line-clamp-4 text-base'
        }`}
      >
        {letter.content}
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-4 text-sm font-medium text-blush-500 transition hover:text-blush-600"
      >
        {open ? 'Réduire' : 'Lire la lettre'}
      </button>
    </div>
  )
}

export default function Letter() {
  const { letters, addLetter } = useLetters()
  const { partnerA, partnerB } = useSiteConfig()
  const recipients = [partnerA, partnerB].filter(Boolean)
  const [step, setStep] = useState('form')
  const [password, setPassword] = useState('')
  const [to, setTo] = useState(partnerA || 'Elma')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setStep(getStoredToken() ? 'form' : 'password')
  }, [])

  useEffect(() => {
    if (recipients.length && !recipients.includes(to)) {
      setTo(recipients[0])
    }
  }, [partnerA, partnerB])

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await verifyPassword(password)
      setStep('form')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLetterSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const letter = await createLetter({ to, content })
      addLetter(letter)
      setContent('')
    } catch (err) {
      if (err.message.includes('Session expirée')) {
        clearStoredToken()
        setStep('password')
      }
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="letter" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blush-400">
            Mots du cœur
          </p>
          <h2 className="mt-3 font-display text-4xl font-light text-stone-800 sm:text-5xl">
            Nos{' '}
            <span className="font-semibold italic text-rose-gold">lettres</span>
          </h2>
        </ScrollReveal>

        <div className="grid gap-10 lg:grid-cols-2">
          <ScrollReveal>
            <div className="rounded-3xl bg-white/70 p-6 shadow-xl shadow-blush-200/30 backdrop-blur-sm sm:p-8">
              <h3 className="font-display text-2xl font-semibold text-stone-800">
                Anciennes lettres
              </h3>
              <p className="mt-2 text-sm text-dusty">
                Tous les mots qu&apos;on s&apos;est écrits, à relire encore et
                encore.
              </p>

              <div className="mt-6 space-y-4">
                {letters.length === 0 ? (
                  <p className="text-sm text-dusty">Aucune lettre pour l&apos;instant.</p>
                ) : (
                  letters.map((letter) => (
                    <LetterCard key={letter.id} letter={letter} />
                  ))
                )}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="rounded-3xl bg-white/70 p-6 shadow-xl shadow-blush-200/30 backdrop-blur-sm sm:p-8">
              <h3 className="font-display text-2xl font-semibold text-stone-800">
                Écrire une lettre
              </h3>
              <p className="mt-2 text-sm text-dusty">
                Rédige un nouveau message pour {partnerA} ou pour {partnerB}.
              </p>

              {step === 'password' ? (
                <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-blush-200 bg-cream px-4 py-3 outline-none focus:border-blush-400"
                    placeholder="Mot de passe"
                    required
                  />
                  {error && <p className="text-sm text-rose-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-gradient-to-r from-blush-400 to-rose-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white"
                  >
                    {submitting ? 'Vérification…' : 'Accéder'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLetterSubmit} className="mt-6 space-y-4">
                  <div>
                    <span className="mb-2 block text-sm font-medium text-stone-700">
                      Destinataire
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {recipients.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setTo(name)}
                          className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                            to === name
                              ? 'border-blush-400 bg-blush-50 text-blush-600'
                              : 'border-blush-200 bg-cream text-dusty hover:border-blush-300'
                          }`}
                        >
                          Pour {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-stone-700">
                      Ta lettre
                    </span>
                    <textarea
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      rows={10}
                      className="w-full rounded-xl border border-blush-200 bg-cream px-4 py-3 outline-none transition focus:border-blush-400 focus:ring-2 focus:ring-blush-100"
                      placeholder="Écris ici tout ce que tu veux lui dire…"
                      required
                    />
                  </label>

                  {error && <p className="text-sm text-rose-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-gradient-to-r from-blush-400 to-rose-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? 'Envoi…' : 'Envoyer la lettre'}
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
