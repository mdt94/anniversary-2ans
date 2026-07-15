export function sendJson(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

export function methodNotAllowed(res) {
  sendJson(res, 405, { error: 'Méthode non autorisée' })
}
