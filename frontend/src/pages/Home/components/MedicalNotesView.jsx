import React from 'react'
import { Activity, ChevronRight } from 'lucide-react'

export default function MedicalNotesView({ notes }) {
  const medicalNotes = notes || [
    { id: 1, title: "Parkinson's Risk", status: 'Active', color: 'bg-green-500' },
    { id: 2, title: 'Sleep Last Night', time: '7 hrs' },
    { id: 3, title: 'Falls this week', value: '2' },
    { id: 4, title: 'Tremor Intensity', value: 'Moderate' },
    { id: 5, title: 'Medication Adherence', status: 'Good', color: 'bg-blue-500' },
    { id: 6, title: 'Last Check-up', time: '2 weeks ago' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Medical Notes</h3>
        <div className="space-y-3">
          {medicalNotes.map((note) => (
            <button
              key={note.id}
              className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all group"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">{note.title}</p>
                {note.time && <p className="text-sm text-gray-600">{note.time}</p>}
                {note.value && <p className="text-sm text-gray-600">{note.value}</p>}
              </div>
              {note.status && (
                <span className={`${note.color} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                  {note.status}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* Vital Signs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-indigo-100 to-blue-100 p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <p className="text-sm font-medium text-gray-700">Heart Rate</p>
          </div>
          <p className="text-3xl font-bold text-indigo-600">96.7</p>
          <p className="text-xs text-gray-600 mt-1">bpm</p>
        </div>
        <div className="bg-linear-to-br from-indigo-100 to-blue-100 p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <p className="text-sm font-medium text-gray-700">SpO2 Rate</p>
          </div>
          <p className="text-3xl font-bold text-indigo-600">98%</p>
          <p className="text-xs text-gray-600 mt-1">oxygen saturation</p>
        </div>
      </div>
    </div>
  )
}
