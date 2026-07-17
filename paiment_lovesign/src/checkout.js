const SITE_ORIGIN =
  import.meta.env.VITE_SITE_ORIGIN || 'http://localhost:5173'
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || ''

export const PRICES = {
  eur: { amount: 49, label: '49 €', currency: 'eur' },
  usd: { amount: 54, label: '$54', currency: 'usd' },
}

export async function startCheckout({ email, currency, demo = true }) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Site-Origin': SITE_ORIGIN,
  }

  try {
    const response = await fetch(`${API_ORIGIN}/api/checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, currency, demo }),
    })

    const text = await response.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('API indisponible — mode démo local.')
    }

    if (!response.ok) {
      throw new Error(data.error || 'Paiement impossible')
    }

    return data
  } catch (error) {
    // Local fallback when the anniversary API is not running
    const setupToken = crypto.randomUUID().replace(/-/g, '')
    return {
      mode: 'demo-local',
      setupToken,
      setupUrl: `${SITE_ORIGIN}/setup?token=${setupToken}`,
      currency,
      amount: PRICES[currency]?.amount * 100,
      notice: error.message,
    }
  }
}

export { SITE_ORIGIN }
