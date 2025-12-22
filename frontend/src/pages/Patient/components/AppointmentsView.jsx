import React from 'react'
import { Calendar } from 'lucide-react'

export default function AppointmentsView() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Appointment Dates</h2>
      <p className="text-gray-600 mb-4">Upcoming Appointments</p>

      <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=doctor" alt="Doctor" className="w-16 h-16 rounded-full bg-white" />
          <div>
            <p className="font-semibold text-lg">Dr Erin Grace</p>
            <p className="text-blue-100">Pediatrician</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <span>Tuesday, July 30 | 9:00 AM-9:30 AM</span>
        </div>
      </div>
    </div>
  )
}
