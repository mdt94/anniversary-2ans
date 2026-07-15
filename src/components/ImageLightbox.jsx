import { useEffect, useState } from 'react'

export default function ImageLightbox({
  open,
  images,
  startIndex = 0,
  title,
  onClose,
}) {
  const [index, setIndex] = useState(startIndex)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (!open) return
    setIndex(startIndex)
    setZoomed(false)
  }, [open, startIndex])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') {
        setIndex((current) => (current + 1) % images.length)
        setZoomed(false)
      }
      if (event.key === 'ArrowLeft') {
        setIndex((current) => (current - 1 + images.length) % images.length)
        setZoomed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, images.length, onClose])

  if (!open || images.length === 0) return null

  const currentImage = images[index]

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-stone-950/95">
      <div className="flex items-center justify-between px-4 py-4 text-white sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            {title}
          </p>
          <p className="text-sm text-white/80">
            {index + 1} / {images.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomed((value) => !value)}
            className="rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
          >
            {zoomed ? 'Réduire' : 'Agrandir'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6 sm:px-10">
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => {
              setIndex((current) => (current - 1 + images.length) % images.length)
              setZoomed(false)
            }}
            className="absolute left-2 z-10 rounded-full bg-white/10 px-3 py-3 text-2xl text-white transition hover:bg-white/20 sm:left-6"
            aria-label="Photo précédente"
          >
            ‹
          </button>
        )}

        <button
          type="button"
          onClick={() => setZoomed((value) => !value)}
          className="flex h-full max-h-[75vh] w-full max-w-5xl items-center justify-center"
        >
          <img
            src={currentImage}
            alt={`${title} - photo ${index + 1}`}
            className={`max-h-full max-w-full object-contain transition-transform duration-300 ${
              zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
          />
        </button>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => {
              setIndex((current) => (current + 1) % images.length)
              setZoomed(false)
            }}
            className="absolute right-2 z-10 rounded-full bg-white/10 px-3 py-3 text-2xl text-white transition hover:bg-white/20 sm:right-6"
            aria-label="Photo suivante"
          >
            ›
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 px-4 pb-6">
          {images.map((image, imageIndex) => (
            <button
              key={`${image}-${imageIndex}`}
              type="button"
              onClick={() => {
                setIndex(imageIndex)
                setZoomed(false)
              }}
              className={`h-14 w-14 overflow-hidden rounded-lg border-2 transition ${
                imageIndex === index
                  ? 'border-blush-300'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
