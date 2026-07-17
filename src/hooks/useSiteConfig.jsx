import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchSetupStatus, getLocalSiteConfig } from '../services/site'
import { RELATIONSHIP_START } from '../utils/relationshipDuration'

const SiteConfigContext = createContext({
  loading: true,
  needsSetup: false,
  partnerA: 'Elma',
  partnerB: 'Yann',
  startDate: RELATIONSHIP_START,
  siteTitle: '',
  refresh: () => {},
})

function parseStartDate(value) {
  if (!value) return RELATIONSHIP_START
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return RELATIONSHIP_START
  return new Date(year, month - 1, day, 21, 0, 0)
}

export function SiteConfigProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)

  const refresh = async () => {
    try {
      const data = await fetchSetupStatus()
      setStatus(data)
    } catch {
      const local = getLocalSiteConfig()
      setStatus({
        needsSetup: !local?.setupComplete && !import.meta.env.VITE_ADMIN_PASSWORD,
        setupComplete: Boolean(local?.setupComplete),
        partnerA: local?.partnerA || 'Elma',
        partnerB: local?.partnerB || 'Yann',
        startDate: local?.startDate || '',
        siteTitle: local?.siteTitle || '',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const value = useMemo(
    () => ({
      loading,
      needsSetup: Boolean(status?.needsSetup),
      partnerA: status?.partnerA || 'Elma',
      partnerB: status?.partnerB || 'Yann',
      startDate: parseStartDate(status?.startDate),
      startDateIso: status?.startDate || '',
      siteTitle: status?.siteTitle || '',
      refresh,
    }),
    [loading, status],
  )

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  return useContext(SiteConfigContext)
}
