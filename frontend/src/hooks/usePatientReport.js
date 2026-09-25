import { useCallback, useEffect, useRef, useState } from 'react'
import { getPatientReport, getPatients } from '../lib/api'

// The device uploads every 15 s, so polling faster only burns ThingSpeak quota.
const REFRESH_MS = 15000

export function usePatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    getPatients()
      .then((data) => {
        if (!cancelled) setPatients(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { patients, loading, error }
}

export function usePatientReport(patientId, { refresh = true } = {}) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Tracks the in-flight patient so a slow response for a previously selected
  // patient cannot overwrite a newer one.
  const activeId = useRef(patientId)

  const load = useCallback(async () => {
    if (!patientId) return
    activeId.current = patientId

    try {
      const data = await getPatientReport(patientId)
      if (activeId.current === patientId) {
        setReport(data)
        setError(null)
      }
    } catch (err) {
      if (activeId.current === patientId) setError(err.message)
    } finally {
      if (activeId.current === patientId) setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    setLoading(true)
    setReport(null)
    load()

    if (!refresh) return undefined
    const timer = setInterval(load, REFRESH_MS)
    return () => clearInterval(timer)
  }, [load, refresh])

  return { report, loading, error, reload: load }
}
