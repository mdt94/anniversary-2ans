import { useEffect } from 'react'
import Hero from './components/Hero'
import Timeline from './components/Timeline'
import MemoryWidgets from './components/MemoryWidgets'
import Letter from './components/Letter'
import SetupScreen from './components/SetupScreen'
import { useRelationshipDuration } from './hooks/useRelationshipDuration'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import {
  SiteConfigProvider,
  useSiteConfig,
} from './hooks/useSiteConfig'
import { formatDuration } from './utils/relationshipDuration'

function Footer() {
  const { startDate } = useSiteConfig()
  const { years, days } = useRelationshipDuration(startDate)
  const durationText = formatDuration({ years, days })

  return (
    <footer className="border-t border-blush-100 py-10 text-center">
      <p className="font-display text-lg italic text-dusty">
        Fait avec amour — {durationText} ♥
      </p>
      <p className="mt-2 text-xs text-dusty/60">
        Powered by LoveSign
      </p>
    </footer>
  )
}

function AnniversarySite() {
  useSmoothScroll()
  const { loading, needsSetup, siteTitle, partnerA, partnerB } = useSiteConfig()

  useEffect(() => {
    if (siteTitle) {
      document.title = `${siteTitle} ♥`
    } else if (partnerA && partnerB) {
      document.title = `${partnerA} & ${partnerB} ♥`
    }
  }, [siteTitle, partnerA, partnerB])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-display text-2xl italic text-rose-gold">LoveSign…</p>
      </div>
    )
  }

  const params = new URLSearchParams(window.location.search)
  const isSetupPath = window.location.pathname.replace(/\/$/, '') === '/setup'

  if (isSetupPath && !needsSetup) {
    window.location.replace('/')
    return null
  }

  if (isSetupPath || needsSetup) {
    return <SetupScreen setupToken={params.get('token') || ''} />
  }

  return (
    <div className="relative overflow-x-hidden">
      <Hero />
      <Timeline />
      <MemoryWidgets />
      <Letter />
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <SiteConfigProvider>
      <AnniversarySite />
    </SiteConfigProvider>
  )
}
