import ScrollReveal from './ScrollReveal'

const PHOTOS = [
  { caption: 'Notre premier café', rotation: -3, gradient: 'from-blush-200 to-blush-100' },
  { caption: 'Un coucher de soleil', rotation: 2, gradient: 'from-rose-100 to-blush-50' },
  { caption: 'Week-end à deux', rotation: -1, gradient: 'from-blush-300/50 to-cream' },
  { caption: 'Rires sans fin', rotation: 4, gradient: 'from-blush-100 to-rose-100' },
  { caption: 'Main dans la main', rotation: -4, gradient: 'from-rose-gold/20 to-blush-50' },
  { caption: 'Notre moment préféré', rotation: 1, gradient: 'from-blush-200/70 to-cream' },
]

function Polaroid({ photo, index }) {
  return (
    <ScrollReveal variant="scale" delay={index * 100}>
      <figure
        className="group cursor-pointer transition-transform duration-500 ease-out hover:z-10 hover:scale-105"
        style={{ transform: `rotate(${photo.rotation}deg)` }}
      >
        <div
          className="rounded-sm bg-white p-3 pb-10 shadow-lg shadow-stone-300/40 transition-all duration-500 group-hover:-rotate-1 group-hover:shadow-xl group-hover:shadow-blush-200/50"
        >
          <div
            className={`aspect-square overflow-hidden bg-gradient-to-br ${photo.gradient} transition-transform duration-500 group-hover:scale-110`}
          >
            <div className="flex h-full items-center justify-center text-dusty/40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 transition-transform duration-500 group-hover:scale-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <figcaption className="mt-3 text-center font-display text-sm italic text-dusty">
            {photo.caption}
          </figcaption>
        </div>
      </figure>
    </ScrollReveal>
  )
}

export default function Gallery() {
  return (
    <section id="gallery" className="relative px-6 py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-blush-50/50 to-transparent"
      />

      <div className="relative mx-auto max-w-5xl">
        <ScrollReveal className="mb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blush-400">
            Souvenirs
          </p>
          <h2 className="mt-3 font-display text-4xl font-light text-stone-800 sm:text-5xl">
            Nos{' '}
            <span className="font-semibold italic text-rose-gold">Polaroïds</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-dusty">
            Des instants figés dans le temps, comme de petits trésors à
            chérir.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
          {PHOTOS.map((photo, index) => (
            <Polaroid key={photo.caption} photo={photo} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
