// Client for the NeuroSense FastAPI backend.
//
// Base URL comes from VITE_API_BASE_URL (see .env.example) so the same build
// works against a local backend and a deployed one.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const TOKEN_KEY = 'neurosense.token'
const USER_KEY = 'neurosense.user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getToken()
    if (!token) throw new ApiError('Not signed in', 401)
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    // fetch only rejects on network failure, so this means the API is down.
    throw new ApiError(`Cannot reach the API at ${BASE_URL}. Is the backend running?`, 0)
  }

  if (!response.ok) {
    let detail = response.statusText
    try {
      const payload = await response.json()
      detail = payload.detail || detail
    } catch {
      // response had no JSON body; keep the status text
    }
    throw new ApiError(detail, response.status)
  }

  return response.json()
}

export async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  return data
}

export function getPatients() {
  return request('/api/patients')
}

export function getPatientReport(patientId, results = 20) {
  return request(`/api/patients/${patientId}/report?results=${results}`)
}

export { ApiError }
