class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function buildUrl(path, query) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
  const url = new URL(`${baseUrl}${path}`, window.location.origin)

  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  if (baseUrl) {
    return url.toString()
  }

  return `${url.pathname}${url.search}`
}

async function request(path, options = {}) {
  const {
    body,
    headers,
    method = 'GET',
    query,
  } = options

  const response = await fetch(buildUrl(path, query), {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      payload?.error || payload?.message || 'Une erreur est survenue',
      response.status,
      payload,
    )
  }

  return payload
}

export { ApiError, request }
