import { methodNotAllowed, sendJson } from './_lib/http.js'
import { createOrder } from './_lib/orders-store.js'
import { getSiteConfig, saveSiteConfig } from './_lib/site-config-store.js'

const PRICES = {
  eur: 4900,
  usd: 5400,
}

function resolveSiteOrigin(req) {
  return (
    process.env.SITE_ORIGIN ||
    req.headers['x-site-origin'] ||
    req.headers.origin ||
    'http://localhost:5173'
  )
}

function resolvePayOrigin(req) {
  return (
    process.env.LOVESIGN_ORIGIN ||
    req.headers.origin ||
    'http://localhost:5174'
  )
}

async function createStripeCheckoutSession({
  email,
  currency,
  amount,
  order,
  siteOrigin,
  payOrigin,
}) {
  const params = new URLSearchParams()
  params.set('mode', 'payment')
  params.set('customer_email', email)
  params.set('success_url', `${siteOrigin}/setup?token=${order.setupToken}&paid=1`)
  params.set('cancel_url', `${payOrigin}/?canceled=1`)
  params.set('line_items[0][quantity]', '1')
  params.set('line_items[0][price_data][currency]', currency)
  params.set('line_items[0][price_data][unit_amount]', String(amount))
  params.set(
    'line_items[0][price_data][product_data][name]',
    'LoveSign — Site couple personnalisé',
  )
  params.set(
    'line_items[0][price_data][product_data][description]',
    'Frise, poèmes, widgets souvenirs + accès admin sécurisé',
  )
  params.set('metadata[orderId]', order.id)
  params.set('metadata[setupToken]', order.setupToken)

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error?.message || 'Erreur Stripe Checkout')
  }
  return data
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res)
  }

  try {
    const { email, currency = 'eur', demo } = req.body ?? {}
    const normalizedCurrency = currency === 'usd' ? 'usd' : 'eur'
    const amount = PRICES[normalizedCurrency]
    const forceDemo = demo === true || !process.env.STRIPE_SECRET_KEY

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendJson(res, 400, { error: 'Adresse e-mail invalide.' })
    }

    const config = await getSiteConfig()
    if (config.setupComplete) {
      return sendJson(res, 409, {
        error: 'Ce site est déjà activé. Contactez le support LoveSign.',
      })
    }

    const order = await createOrder({
      email,
      currency: normalizedCurrency,
      amount,
      demo: forceDemo,
    })

    await saveSiteConfig({
      ...config,
      setupToken: order.setupToken,
      orderId: order.id,
      currency: normalizedCurrency,
      createdAt: config.createdAt || new Date().toISOString(),
    })

    const siteOrigin = resolveSiteOrigin(req)

    if (!forceDemo) {
      const session = await createStripeCheckoutSession({
        email,
        currency: normalizedCurrency,
        amount,
        order,
        siteOrigin,
        payOrigin: resolvePayOrigin(req),
      })

      return sendJson(res, 200, {
        mode: 'stripe',
        checkoutUrl: session.url,
        orderId: order.id,
      })
    }

    return sendJson(res, 200, {
      mode: 'demo',
      orderId: order.id,
      setupToken: order.setupToken,
      setupUrl: `${siteOrigin}/setup?token=${order.setupToken}`,
      amount,
      currency: normalizedCurrency,
    })
  } catch (error) {
    return sendJson(res, 500, {
      error: error.message || 'Impossible de créer la commande.',
    })
  }
}
