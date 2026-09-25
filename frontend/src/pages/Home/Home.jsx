import React, { useState } from 'react'
import { usePatients } from '../../hooks/usePatientReport'
import DoctorHeader from './components/DoctorHeader'
import PatientSidebar from './components/PatientSidebar'
import NavigationTabs from './components/NavigationTabs'
import ScheduledAppointments from './components/ScheduledAppointments'
import MedicalNotesView from './components/MedicalNotesView'
import ScheduleChangesView from './components/ScheduleChangesView'

export default function Home() {
  const [pickedPatient, setSelectedPatient] = useState(null)
  const [activeTab, setActiveTab] = useState('notes') // Default to Medical Notes
  const { patients, loading, error } = usePatients()

  // Derived rather than set in an effect: until the user picks someone, the
  // selection is simply the first patient in the roster.
  const selectedPatient = pickedPatient ?? patients[0]?.id ?? null

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DoctorHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Content Grid with Patient Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar - Patient List */}
            <div className="lg:col-span-3">
              {error ? (
                <div className="bg-white rounded-3xl p-5 shadow-lg border border-red-200">
                  <p className="font-semibold text-red-700">Cannot load patients</p>
                  <p className="text-sm text-slate-600 mt-1">{error}</p>
                </div>
              ) : (
                <PatientSidebar
                  patients={loading ? [] : patients}
                  selectedPatient={selectedPatient}
                  setSelectedPatient={setSelectedPatient}
                />
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              {/* Content based on active tab */}
              {activeTab === 'appointments' && <ScheduledAppointments />}
              {activeTab === 'notes' && <MedicalNotesView />}
              {activeTab === 'changes' && <ScheduleChangesView />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}