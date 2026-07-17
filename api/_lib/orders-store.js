import crypto from 'crypto'
import { head, put } from '@vercel/blob'

const ORDERS_PATH = 'memories/orders.json'

function blobOptions(extra = {}) {
  return { access: 'public', ...extra }
}

function isBlobMissing(error) {
  const message = error?.message?.toLowerCase() ?? ''
  return (
    error?.name === 'BlobNotFoundError' ||
    error?.statusCode === 404 ||
    message.includes('not found') ||
    message.includes('does not exist')
  )
}

async function readOrders() {
  try {
    const blob = await head(ORDERS_PATH, blobOptions())
    const response = await fetch(blob.url)
    if (!response.ok) return []
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (isBlobMissing(error)) return []
    throw error
  }
}

async function writeOrders(orders) {
  await put(ORDERS_PATH, JSON.stringify(orders), {
    ...blobOptions(),
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

export async function createOrder({
  email,
  currency,
  amount,
  demo = false,
}) {
  const orders = await readOrders()
  const order = {
    id: crypto.randomUUID(),
    email: email || '',
    currency,
    amount,
    status: 'paid',
    setupToken: crypto.randomBytes(24).toString('hex'),
    demo: Boolean(demo),
    createdAt: new Date().toISOString(),
  }
  orders.push(order)
  await writeOrders(orders)
  return order
}

export async function findOrderBySetupToken(token) {
  if (!token) return null
  const orders = await readOrders()
  return orders.find((order) => order.setupToken === token) ?? null
}

export async function markOrderSetupComplete(orderId) {
  const orders = await readOrders()
  const next = orders.map((order) =>
    order.id === orderId
      ? { ...order, setupComplete: true, setupCompletedAt: new Date().toISOString() }
      : order,
  )
  await writeOrders(next)
}
