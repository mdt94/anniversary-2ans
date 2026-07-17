import { useEffect, useState } from 'react'
import ImageLightbox from './ImageLightbox'

export default function MemoryDetailModal({
  open,
  step,
  isAdmin,
  onClose,
  onEdit,
  onDelete,
  onAddPhotos,
}) {
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  const photos = step?.photos ?? []
  const hasPhotos = photos.length > 0

  useEffect(() => {
    if (!open) return
    setIndex(0)
    setLightboxOpen(false)
    setAutoPlay(true)
  }, [open, step?.id])

  useEffect(() => {
    if (!open || !autoPlay || photos.length <= 1) return

    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % photos.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [open, autoPlay, photos.length])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (!hasPhotos) return
      if (event.key === 'ArrowRight') {
        setAutoPlay(false)
        setIndex((current) => (current + 1) % photos.length)
      }
      if (event.key === 'ArrowLeft') {
        setAutoPlay(false)
        setIndex((current) => (current - 1 + photos.length) % photos.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, hasPhotos, photos.length, onClose])

  if (!open || !step) return null

  const openLightbox = (photoIndex) => {
    setLightboxIndex(photoIndex)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Fermer"
          className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-blush-200/40">
          <div className="flex items-start justify-between gap-4 border-b border-blush-100 px-6 py-5 sm:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-blush-400">
                {step.date}
              </p>
              <h3 className="mt-1 font-display text-3xl font-semibold text-stone-800 sm:text-4xl">
                {step.title}
              </h3>
              {step.description && (
                <p className="mt-3 max-w-2xl leading-relaxed text-dusty">
                  {step.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-dusty/60 transition hover:bg-blush-50 hover:text-blush-400"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            {hasPhotos ? (
              <div>
                <div className="relative overflow-hidden rounded-2xl bg-stone-100">
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="block w-full"
                  >
                    <img
                      src={photos[index]}
                      alt={`${step.title} - photo ${index + 1}`}
                      className="mx-auto max-h-[50vh] w-full object-contain transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </button>

                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setAutoPlay(false)
                          setIndex(
                            (current) => (current - 1 + photos.length) % photos.length,
                          )
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-xl text-stone-700 shadow"
                        aria-label="Photo précédente"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAutoPlay(false)
                          setIndex((current) => (current + 1) % photos.length)
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-xl text-stone-700 shadow"
                        aria-label="Photo suivante"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-dusty">
                    Photo {index + 1} sur {photos.length}
                  </p>
                  {photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setAutoPlay((value) => !value)}
                      className="rounded-full border border-blush-200 px-4 py-1.5 text-sm text-dusty transition hover:border-blush-300"
                    >
                      {autoPlay ? 'Pause' : 'Défilement auto'}
                    </button>
                  )}
                </div>

                {photos.length > 1 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                    {photos.map((photo, photoIndex) => (
                      <button
                        key={`${step.id}-thumb-${photoIndex}`}
                        type="button"
                        onClick={() => {
                          setAutoPlay(false)
                          setIndex(photoIndex)
                        }}
                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                          photoIndex === index
                            ? 'border-blush-400'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={photo}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="mt-4 text-sm font-medium text-blush-500 transition hover:text-blush-600"
                >
                  Agrandir la photo
                </button>
              </div>
            ) : (
              <div
                className={`flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br ${step.gradient}`}
              >
                <div className="text-center text-dusty/60">
                  <span className="text-4xl">{step.icon}</span>
                  <p className="mt-3 text-sm">Aucune photo pour ce souvenir</p>
                </div>
                <button
                  type="button"
                  onClick={() => onAddPhotos(step)}
                  className="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-blush-500 shadow-sm transition hover:border-blush-300 hover:text-blush-600"
                >
                  <span aria-hidden="true">📷</span>
                  Ajouter des photos
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-blush-100 px-6 py-4 sm:px-8">
            <button
              type="button"
              onClick={() => onAddPhotos(step)}
              className="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-blush-50/60 px-5 py-2.5 text-sm font-medium text-blush-500 transition hover:border-blush-300 hover:bg-blush-50 hover:text-blush-600"
            >
              <span aria-hidden="true">📷</span>
              Ajouter des photos
            </button>
            <button
              type="button"
              onClick={() => onEdit(step)}
              className="rounded-full border border-blush-200 px-5 py-2.5 text-sm font-medium text-dusty transition hover:border-blush-300 hover:text-blush-500"
            >
              Modifier le nom
            </button>
            {isAdmin && step.custom && (
              <button
                type="button"
                onClick={() => onDelete(step)}
                className="rounded-full border border-rose-200 px-5 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      <ImageLightbox
        open={lightboxOpen}
        images={photos}
        startIndex={lightboxIndex}
        title={step.title}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
