import React from 'react'
import { User, ChevronRight } from 'lucide-react'

export default function PatientSidebar({ patients, selectedPatient, setSelectedPatient }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Patient Dashboard</h2>
      <div className="space-y-2">
        {patients.map((patient) => (
          <button
            key={patient.id}
            onClick={() => setSelectedPatient(patient.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
              selectedPatient === patient.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-blue-50 text-gray-700 hover:bg-blue-100'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedPatient === patient.id ? 'bg-white/20' : 'bg-indigo-600'
              }`}
            >
              <User className={`w-5 h-5 text-white`} />
            </div>
            <span className="font-medium flex-1 text-left">{patient.name}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  )
}
