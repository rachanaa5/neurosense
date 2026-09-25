import React, { useState } from 'react'
import { Heart, Activity, Calendar, Bell, Settings, User, CreditCard, Lock, HelpCircle, LogOut, ChevronRight } from 'lucide-react'
import PatientHeader from './components/PatientHeader'
import HealthMetrics from './components/HealthMetrics'
import RightColumn from './components/RightColumn'
import AppointmentsView from './components/AppointmentsView'
import AnalyticsView from './components/AnalyticsView'
import SettingsView from './components/SettingsView'
import { usePatientReport } from '../../hooks/usePatientReport'

// P001 is the patient wired to the physical wearable in backend/main.py.
const PATIENT_ID = 'P001'

export default function HealthcareDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { report, loading, error } = usePatientReport(PATIENT_ID)
  const [notifications, setNotifications] = useState({
    general: true,
    sound: true,
    soundCall: true,
    vibrate: false,
    specialOffers: false,
    payments: true,
    promoDiscount: false,
    cashback: true
  })

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PatientHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="grid md:grid-cols-3 gap-6">
            <HealthMetrics report={report} loading={loading} error={error} />
            <RightColumn />
          </div>
        )}

        {activeTab === 'appointments' && <AppointmentsView />}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'settings' && (
          <SettingsView notifications={notifications} toggleNotification={toggleNotification} />
        )}
      </main>
    </div>
  )
}