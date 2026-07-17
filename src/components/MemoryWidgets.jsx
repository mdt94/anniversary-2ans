import { useEffect, useState } from 'react'
import ScrollReveal from './ScrollReveal'
import {
  clearStoredToken,
  createWidget,
  deleteWidget,
  fetchWidgets,
  getStoredToken,
  verifyPassword,
} from '../services/widgets'

const ACCENTS = [
  { id: 'blush', label: 'Blush', className: 'from-blush-200 to-blush-50' },
  { id: 'rose', label: 'Rose', className: 'from-rose-200 to-cream' },
  { id: 'gold', label: 'Or rose', className: 'from-rose-gold/40 to-blush-50' },
]

function formatDate(isoDate) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function accentClass(accent) {
  return ACCENTS.find((item) => item.id === accent)?.className || ACCENTS[0].className
}

function WidgetCard({ widget, isAdmin, onDelete }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-blush-100/80 bg-white/70 shadow-md shadow-blush-100/40 backdrop-blur-sm transition duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-blush-200/40">
      <div
        className={`relative aspect-[4/3] bg-gradient-to-br ${accentClass(widget.accent)}`}
      >
        {widget.photos?.[0] ? (
          <img
            src={widget.photos[0]}
            alt={widget.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-dusty/40">
            ♥
          </div>
        )}
        {widget.photos?.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-dusty backdrop-blur">
            +{widget.photos.length - 1}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-widest text-blush-400">
          {formatDate(widget.date)}
        </p>
        <h3 className="mt-1 font-display text-2xl font-semibold text-stone-800">
          {widget.title}
        </h3>
        {widget.caption && (
          <p className="mt-2 text-sm leading-relaxed text-dusty">{widget.caption}</p>
        )}
        {isAdmin && (
          <button
            type="button"
            onClick={() => onDelete(widget)}
            className="mt-4 text-xs font-medium uppercase tracking-widest text-dusty/70 transition hover:text-blush-500"
          >
            Supprimer
          </button>
        )}
      </div>
    </article>
  )
}

function WidgetForm({ onClose, onCreated }) {
  const [step, setStep] = useState(getStoredToken() ? 'form' : 'password')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [date, setDate] = useState('')
  const [accent, setAccent] = useState('blush')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handlePassword = async (event) => {
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

  const handleCreate = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const widget = await createWidget({
        title,
        caption,
        date,
        accent,
        photoFiles: files,
      })
      onCreated(widget)
      onClose()
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4 backdrop-blur-sm">
      <div
        data-lenis-prevent
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-blush-100 bg-cream p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-blush-400">
              Widget souvenir
            </p>
            <h3 className="mt-1 font-display text-2xl text-stone-800">
              Créer un widget
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-dusty transition hover:text-blush-500"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {step === 'password' ? (
          <form onSubmit={handlePassword} className="space-y-4">
            <p className="text-sm text-dusty">
              Entrez le mot de passe de votre frise pour créer un widget.
            </p>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-blush-100 bg-white px-4 py-3 outline-none focus:border-blush-300 focus:ring-2 focus:ring-blush-200/60"
              placeholder="Mot de passe"
            />
            {error && <p className="text-sm text-blush-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-blush-400 to-rose-gold px-5 py-3 font-medium text-white disabled:opacity-60"
            >
              {submitting ? 'Vérification…' : 'Continuer'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-dusty">
                Titre
              </span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-blush-100 bg-white px-4 py-3 outline-none focus:border-blush-300"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-dusty">
                Date
              </span>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-blush-100 bg-white px-4 py-3 outline-none focus:border-blush-300"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-dusty">
                Légende
              </span>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full rounded-xl border border-blush-100 bg-white px-4 py-3 outline-none focus:border-blush-300"
              />
            </label>
            <fieldset>
              <legend className="mb-2 text-xs uppercase tracking-widest text-dusty">
                Accent
              </legend>
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAccent(item.id)}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      accent === item.id
                        ? 'bg-blush-400 text-white'
                        : 'bg-white text-dusty ring-1 ring-blush-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-dusty">
                Photos
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="w-full text-sm text-dusty"
              />
            </label>
            {error && <p className="text-sm text-blush-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-blush-400 to-rose-gold px-5 py-3 font-medium text-white disabled:opacity-60"
            >
              {submitting ? 'Création…' : 'Créer le widget'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function MemoryWidgets() {
  const [widgets, setWidgets] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(Boolean(getStoredToken()))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWidgets()
      .then(setWidgets)
      .catch(() => setWidgets([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setIsAdmin(Boolean(getStoredToken()))
  }, [formOpen])

  const handleDelete = async (widget) => {
    if (!window.confirm(`Supprimer le widget « ${widget.title} » ?`)) return
    try {
      await deleteWidget(widget.id)
      setWidgets((current) => current.filter((item) => item.id !== widget.id))
    } catch (error) {
      window.alert(error.message)
    }
  }

  return (
    <section id="widgets" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mb-14 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blush-400">
            Widgets
          </p>
          <h2 className="mt-3 font-display text-4xl font-light text-stone-800 sm:text-5xl">
            Souvenirs en{' '}
            <span className="font-semibold italic text-rose-gold">cartes</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-dusty">
            Créez de petits widgets pour immortaliser un instant — une photo, une
            date, une émotion.
          </p>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white/70 px-5 py-2.5 text-sm font-medium text-dusty shadow-sm transition hover:border-blush-300 hover:text-blush-500"
          >
            <span aria-hidden="true">＋</span>
            Créer un widget
          </button>
        </ScrollReveal>

        {loading ? (
          <p className="text-center text-dusty">Chargement des widgets…</p>
        ) : widgets.length === 0 ? (
          <ScrollReveal variant="scale" className="mx-auto max-w-md rounded-3xl border border-dashed border-blush-200 bg-white/40 px-8 py-16 text-center">
            <p className="font-display text-2xl text-stone-700">
              Aucun widget pour l’instant
            </p>
            <p className="mt-2 text-sm text-dusty">
              Ajoutez votre premier souvenir sous forme de carte.
            </p>
          </ScrollReveal>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {widgets.map((widget, index) => (
              <ScrollReveal key={widget.id} delay={index * 90} variant="scale">
                <WidgetCard
                  widget={widget}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <WidgetForm
          onClose={() => setFormOpen(false)}
          onCreated={(widget) => {
            setWidgets((current) => [widget, ...current])
            setIsAdmin(true)
          }}
        />
      )}
    </section>
  )
}
