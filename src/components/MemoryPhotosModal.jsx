import { useEffect, useState } from 'react'
import {
  appendPhotosToMemory,
  clearStoredToken,
  getStoredToken,
  verifyPassword,
} from '../services/memories'

function PhotoPreview({ file, onRemove }) {
  const [preview, setPreview] = useState('')

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl">
      <img src={preview} alt={file.name} className="h-full w-full object-cover" />
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

export default function MemoryPhotosModal({
  open,
  memory,
  onClose,
  onSuccess,
}) {
  const [step, setStep] = useState('password')
  const [password, setPassword] = useState('')
  const [photoFiles, setPhotoFiles] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    setStep(getStoredToken() ? 'form' : 'password')
    setPassword('')
    setPhotoFiles([])
    setError('')
  }, [open, memory?.id])

  if (!open || !memory) return null

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await verifyPassword(password)
      setStep('form')
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

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files ?? [])
    setPhotoFiles((current) => [...current, ...files])
    event.target.value = ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const result = await appendPhotosToMemory(memory.id, photoFiles)
      onSuccess(result, memory)
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
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
        >
          ✕
        </button>

        {step === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <h3 className="font-display text-3xl font-semibold text-stone-800">
              Ajouter des photos
            </h3>
            <p className="text-sm text-dusty">
              Entre le mot de passe pour enrichir « {memory.title} ».
            </p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-display text-3xl font-semibold text-stone-800">
              Enrichir le souvenir
            </h3>
            <p className="text-sm text-dusty">
              Ajoute des photos à « {memory.title} » sans modifier le reste.
            </p>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blush-200 bg-blush-50/40 px-4 py-8 text-center">
              <span className="text-2xl">📷</span>
              <span className="mt-2 text-sm font-medium">Ajouter des photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>

            {photoFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
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

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting || photoFiles.length === 0}
              className="w-full rounded-full bg-gradient-to-r from-blush-400 to-rose-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white disabled:opacity-60"
            >
              {submitting ? 'Ajout en cours…' : 'Ajouter à la frise'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
