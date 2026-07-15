import Hero from './components/Hero'
import Timeline from './components/Timeline'
import Gallery from './components/Gallery'
import Letter from './components/Letter'
import { useRelationshipDuration } from './hooks/useRelationshipDuration'
import {
  RELATIONSHIP_START,
  formatDuration,
} from './utils/relationshipDuration'

function Footer() {
  const { years, days } = useRelationshipDuration(RELATIONSHIP_START)
  const durationText = formatDuration({ years, days })

  return (
    <footer className="border-t border-blush-100 py-10 text-center">
      <p className="font-display text-lg italic text-dusty">
        Fait avec amour — {durationText} ♥
      </p>
      <p className="mt-2 text-xs text-dusty/60">
        Depuis le 21 juin 2024 à 21h
      </p>
    </footer>
  )
}

export default function App() {
  return (
    <div className="relative overflow-x-hidden">
      <Hero />
      <Timeline />
      <Gallery />
      <Letter />
      <Footer />
    </div>
  )
}
