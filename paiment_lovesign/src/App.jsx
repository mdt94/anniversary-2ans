import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { PRICES, SITE_ORIGIN, startCheckout } from './checkout'

const FEATURES = [
  {
    title: 'Frise du cœur',
    text: 'Une timeline élégante pour raconter votre histoire, moment après moment.',
  },
  {
    title: 'Poèmes & lettres',
    text: 'Un espace privé pour écrire et relire vos mots, protégé par mot de passe.',
  },
  {
    title: 'Widgets souvenirs',
    text: 'Créez des cartes souvenirs avec photos, dates et légendes — à votre rythme.',
  },
]

function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      autoRaf: true,
    })

    return () => lenis.destroy()
  }, [])
}

function CurrencyToggle({ currency, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-blush-200 bg-white/70 p-1 shadow-sm">
      {['eur', 'usd'].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            currency === code
              ? 'bg-blush-400 text-white'
              : 'text-dusty hover:text-blush-500'
          }`}
        >
          {code === 'eur' ? 'EUR €' : 'USD $'}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  useSmoothScroll()
  const [currency, setCurrency] = useState('eur')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [canceled] = useState(
    () => new URLSearchParams(window.location.search).get('canceled') === '1',
  )

  const price = PRICES[currency]

  const handleCheckout = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const result = await startCheckout({
        email,
        currency,
        demo: !import.meta.env.VITE_STRIPE_LIVE,
      })

      if (result.mode === 'stripe' && result.checkoutUrl) {
        window.location.href = result.checkoutUrl
        return
      }

      if (result.setupUrl) {
        window.location.href = result.setupUrl
        return
      }

      throw new Error('Réponse de paiement inattendue')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="animate-pulse-soft absolute -left-28 top-10 h-[28rem] w-[28rem] rounded-full bg-blush-200/45 blur-3xl" />
        <div className="animate-pulse-soft absolute -right-24 top-40 h-80 w-80 rounded-full bg-rose-gold/20 blur-3xl [animation-delay:1.5s]" />
        <div className="grain absolute inset-0 opacity-60" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <p className="font-display text-2xl font-semibold italic text-rose-gold">
          LoveSign
        </p>
        <a
          href="#acheter"
          className="rounded-full border border-blush-200 bg-white/70 px-4 py-2 text-sm font-medium text-dusty transition hover:border-blush-300 hover:text-blush-500"
        >
          Offrir
        </a>
      </header>

      <main className="relative z-10">
        <section className="mx-auto flex min-h-[88vh] max-w-5xl flex-col justify-center px-6 pb-20 pt-8">
          <div className="animate-rise max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-blush-400">
              Site couple sur mesure
            </p>
            <h1 className="mt-5 font-display text-5xl font-light leading-[1.05] text-ink sm:text-7xl">
              LoveSign
              <span className="mt-2 block bg-gradient-to-r from-blush-400 to-rose-gold bg-clip-text text-4xl font-semibold italic text-transparent sm:text-5xl">
                votre histoire, en ligne
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-dusty sm:text-xl">
              Un écrin digital pour votre couple : frise, poèmes privés et
              widgets souvenirs — le même esprit que le site anniversary, prêt
              à personnaliser.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#acheter"
                className="rounded-full bg-gradient-to-r from-blush-400 to-rose-gold px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-blush-200/50 transition hover:brightness-105"
              >
                Acheter — {price.label}
              </a>
              <CurrencyToggle currency={currency} onChange={setCurrency} />
            </div>
          </div>

          <div className="animate-float mt-16 hidden max-w-sm self-end rounded-[2rem] border border-blush-100 bg-white/55 p-6 shadow-xl shadow-blush-100/40 backdrop-blur-md sm:block">
            <p className="text-xs uppercase tracking-[0.3em] text-blush-400">
              Aperçu
            </p>
            <p className="mt-3 font-display text-3xl text-stone-800">
              2 ans et 25 jours
              <span className="block italic text-rose-gold">ensemble</span>
            </p>
            <p className="mt-3 text-sm text-dusty">
              Compteur vivant · frise · lettres · widgets
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-center text-sm font-medium uppercase tracking-[0.3em] text-blush-400">
            Inclus
          </p>
          <h2 className="mt-3 text-center font-display text-4xl font-light text-stone-800">
            Tout pour raconter{' '}
            <span className="font-semibold italic text-rose-gold">votre lien</span>
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-blush-100 bg-white/65 p-6 shadow-md shadow-blush-100/40 backdrop-blur-sm"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <h3 className="font-display text-2xl text-stone-800">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-dusty">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="acheter" className="mx-auto max-w-lg px-6 py-24">
          <div className="rounded-[2rem] border border-blush-100 bg-white/80 p-8 shadow-2xl shadow-blush-100/50 backdrop-blur-md sm:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-blush-400">
              Paiement
            </p>
            <h2 className="mt-3 font-display text-4xl font-light text-stone-800">
              Activer LoveSign
            </h2>
            <p className="mt-3 text-dusty">
              Après le paiement, vous créez le mot de passe de votre frise et
              de vos poèmes.
            </p>

            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="font-display text-4xl text-rose-gold">{price.label}</p>
              <CurrencyToggle currency={currency} onChange={setCurrency} />
            </div>

            {canceled && (
              <p className="mt-4 rounded-xl bg-blush-50 px-4 py-3 text-sm text-blush-500">
                Paiement annulé. Vous pouvez réessayer quand vous voulez.
              </p>
            )}

            <form onSubmit={handleCheckout} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-dusty">
                  E-mail
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-blush-100 bg-cream/80 px-4 py-3 outline-none transition focus:border-blush-300 focus:ring-2 focus:ring-blush-200/60"
                  placeholder="vous@email.com"
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
                {submitting
                  ? 'Redirection…'
                  : `Payer ${price.label} et créer mon accès`}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-dusty/70">
              Paiement sécurisé · EUR ou USD · puis écran de création de mot de
              passe sur votre site
            </p>
            <p className="mt-2 text-center text-xs text-dusty/50">
              Site activé : {SITE_ORIGIN}
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-blush-100 py-10 text-center">
        <p className="font-display text-lg italic text-dusty">LoveSign ♥</p>
      </footer>
    </div>
  )
}
