import { useEffect, useState } from 'react'
import { createMemory, getStoredToken, verifyPassword } from '../services/memories'

function PhotoPreview({ file, onRemove }) {
  const [preview, setPreview] = useState('')

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl">
      <img
        src={preview}
        alt={file.name}
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-full bg-stone-900/70 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        Retirer
      </button>
    </div>
  )
}

export default function AddMemoryModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState('password')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [photoFiles, setPhotoFiles] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    if (getStoredToken()) {
      setStep('form')
    } else {
      setStep('password')
    }

    setPassword('')
    setTitle('')
    setDate('')
    setPhotoFiles([])
    setError('')
  }, [open])

  if (!open) return null

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

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files ?? [])
    setPhotoFiles((current) => [...current, ...files])
    event.target.value = ''
  }

  const handleMemorySubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const memory = await createMemory({ title, date, photoFiles })
      onSuccess(memory)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl shadow-blush-200/40 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-dusty/60 transition-colors hover:text-blush-400"
          aria-label="Fermer la fenêtre"
        >
          ✕
        </button>

        {step === 'password' ? (
          <>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-blush-400">
              Espace privé
            </p>
            <h3 className="mt-2 font-display text-3xl font-semibold text-stone-800">
              Ajouter un souvenir
            </h3>
            <p className="mt-2 text-sm text-dusty">
              Entre le mot de passe pour accéder au formulaire.
            </p>

            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">
                  Mot de passe
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-blush-200 bg-cream px-4 py-3 outline-none transition focus:border-blush-400 focus:ring-2 focus:ring-blush-100"
                  placeholder="••••••••"
                  required
                  autoFocus
                />
              </label>

              {error && (
                <p className="text-sm text-rose-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-gradient-to-r from-blush-400 to-rose-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? 'Vérification…' : 'Accéder'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-blush-400">
              Nouveau souvenir
            </p>
            <h3 className="mt-2 font-display text-3xl font-semibold text-stone-800">
              Enrichir notre frise
            </h3>

            <form onSubmit={handleMemorySubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">
                  Nom du souvenir
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-xl border border-blush-200 bg-cream px-4 py-3 outline-none transition focus:border-blush-400 focus:ring-2 focus:ring-blush-100"
                  placeholder="Ex. Notre premier voyage"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">
                  Date du souvenir
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-xl border border-blush-200 bg-cream px-4 py-3 outline-none transition focus:border-blush-400 focus:ring-2 focus:ring-blush-100"
                  required
                />
              </label>

              <div>
                <span className="mb-2 block text-sm font-medium text-stone-700">
                  Photos du souvenir
                </span>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blush-200 bg-blush-50/40 px-4 py-8 text-center transition hover:border-blush-300 hover:bg-blush-50">
                  <span className="text-2xl">📷</span>
                  <span className="mt-2 text-sm font-medium text-stone-700">
                    Clique pour ajouter des photos
                  </span>
                  <span className="mt-1 text-xs text-dusty">
                    Tu peux en sélectionner plusieurs
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                {photoFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {photoFiles.map((file, index) => (
                      <PhotoPreview
                        key={`${file.name}-${index}`}
                        file={file}
                        onRemove={() =>
                          setPhotoFiles((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-rose-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-gradient-to-r from-blush-400 to-rose-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? 'Enregistrement…' : 'Ajouter à la frise'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
