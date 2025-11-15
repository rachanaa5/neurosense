import React, { useState } from 'react'
import DoctorHeader from './components/DoctorHeader'
import PatientSidebar from './components/PatientSidebar'
import NavigationTabs from './components/NavigationTabs'
import ScheduledAppointments from './components/ScheduledAppointments'
import MedicalNotesView from './components/MedicalNotesView'
import ScheduleChangesView from './components/ScheduleChangesView'

export default function Home() {
  const [selectedPatient, setSelectedPatient] = useState(1)
  const [activeTab, setActiveTab] = useState('notes') // Default to Medical Notes

  const patients = [
    { id: 1, name: 'Patient 1' },
    { id: 2, name: 'Patient 2' },
    { id: 3, name: 'Patient 3' },
    { id: 4, name: 'Patient 4' },
    { id: 5, name: 'Patient 5' },
  ]

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
              <PatientSidebar
                patients={patients}
                selectedPatient={selectedPatient}
                setSelectedPatient={setSelectedPatient}
              />
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