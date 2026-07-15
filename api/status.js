import { methodNotAllowed, sendJson } from './_lib/http.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res)
  }

  return sendJson(res, 200, {
    adminPassword: Boolean(process.env.ADMIN_PASSWORD),
    adminSecret: Boolean(process.env.ADMIN_SECRET),
    blobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    blobStoreId: Boolean(process.env.BLOB_STORE_ID),
  })
}
