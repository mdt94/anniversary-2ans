import { useEffect, useState } from 'react'
import ScrollReveal from './ScrollReveal'
import { completeSetup } from '../services/site'

export default function SetupScreen({ setupToken = '' }) {
  const [partnerA, setPartnerA] = useState('')
  const [partnerB, setPartnerB] = useState('')
  const [startDate, setStartDate] = useState('')
  const [siteTitle, setSiteTitle] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'LoveSign — Activer votre site'
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await completeSetup({
        partnerA,
        partnerB,
        startDate,
        siteTitle,
        password,
        confirmPassword,
        setupToken: setupToken || undefined,
      })
      window.location.replace('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="animate-pulse-soft absolute -left-24 top-16 h-80 w-80 rounded-full bg-blush-200/50 blur-3xl" />
        <div className="animate-pulse-soft absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-blush-100/70 blur-3xl [animation-delay:2s]" />
      </div>

      <ScrollReveal className="relative z-10 w-full max-w-lg">
        <div className="rounded-3xl border border-blush-100 bg-white/80 p-8 shadow-xl shadow-blush-100/50 backdrop-blur-md sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blush-400">
            LoveSign
          </p>
          <h1 className="mt-3 font-display text-4xl font-light text-stone-800">
            Créez votre{' '}
            <span className="font-semibold italic text-rose-gold">accès</span>
          </h1>
          <p className="mt-3 text-dusty">
            Ce mot de passe protégera votre frise et vos poèmes. Vous pourrez
            ensuite ajouter des widgets souvenirs.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-dusty">
                  Prénom 1
                </span>
                <input
                  required
                  value={partnerA}
                  onChange={(e) => setPartnerA(e.target.value)}
                  className="w-full rounded-xl border border-blush-100 bg-cream/80 px-4 py-3 outline-none transition focus:border-blush-300 focus:ring-2 focus:ring-blush-200/60"
                  placeholder="Elma"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-dusty">
                  Prénom 2
                </span>
                <input
                  required
                  value={partnerB}
                  onChange={(e) => setPartnerB(e.target.value)}
                  className="w-full rounded-xl border border-blush-100 bg-cream/80 px-4 py-3 outline-none transition focus:border-blush-300 focus:ring-2 focus:ring-blush-200/60"
                  placeholder="Yann"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-dusty">
                Depuis quand
              </span>
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-blush-100 bg-cream/80 px-4 py-3 outline-none transition focus:border-blush-300 focus:ring-2 focus:ring-blush-200/60"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-dusty">
                Titre du site (optionnel)
              </span>
              <input
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full rounded-xl border border-blush-100 bg-cream/80 px-4 py-3 outline-none transition focus:border-blush-300 focus:ring-2 focus:ring-blush-200/60"
                placeholder="2 ans ensemble"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-dusty">
                Mot de passe (frise & poèmes)
              </span>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-blush-100 bg-cream/80 px-4 py-3 outline-none transition focus:border-blush-300 focus:ring-2 focus:ring-blush-200/60"
                placeholder="••••••••"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-dusty">
                Confirmer le mot de passe
              </span>
              <input
                required
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-blush-100 bg-cream/80 px-4 py-3 outline-none transition focus:border-blush-300 focus:ring-2 focus:ring-blush-200/60"
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p className="rounded-xl bg-blush-50 px-4 py-3 text-sm text-blush-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-blush-400 to-rose-gold px-6 py-3.5 font-medium text-white shadow-lg shadow-blush-200/50 transition hover:brightness-105 disabled:opacity-60"
            >
              {submitting ? 'Activation…' : 'Activer mon site ♥'}
            </button>
          </form>
        </div>
      </ScrollReveal>
    </div>
  )
}
