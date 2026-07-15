import { methodNotAllowed, sendJson } from './_lib/http.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res)
  }

  const blobReady = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  )

  return sendJson(res, 200, {
    adminPassword: Boolean(process.env.ADMIN_PASSWORD),
    adminSecret: Boolean(process.env.ADMIN_SECRET),
    blobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    blobStoreId: Boolean(process.env.BLOB_STORE_ID),
    blobReady,
    ok: Boolean(process.env.ADMIN_PASSWORD) &&
      Boolean(process.env.ADMIN_SECRET) &&
      blobReady,
  })
}
