export const RELATIONSHIP_START = new Date(2024, 5, 21, 21, 0, 0)

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getRelationshipDuration(startDate = RELATIONSHIP_START) {
  const now = new Date()
  const startDay = startDate.getDate()
  const startMonth = startDate.getMonth()

  let years = now.getFullYear() - startDate.getFullYear()
  const hasReachedAnniversaryThisYear =
    now.getMonth() > startMonth ||
    (now.getMonth() === startMonth && now.getDate() >= startDay)

  if (!hasReachedAnniversaryThisYear) {
    years--
  }

  const lastAnniversary = new Date(
    now.getFullYear() - (hasReachedAnniversaryThisYear ? 0 : 1),
    startMonth,
    startDay,
  )

  const days = Math.floor(
    (startOfDay(now) - startOfDay(lastAnniversary)) / (1000 * 60 * 60 * 24),
  )

  return { years, days }
}

export function formatDuration({ years, days }) {
  const yearsLabel = years === 1 ? 'an' : 'ans'
  const daysLabel = days === 1 ? 'jour' : 'jours'
  return `${years} ${yearsLabel} et ${days} ${daysLabel}`
}
