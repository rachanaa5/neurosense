import React from 'react'
import { Calendar, ChevronRight, User, CreditCard, HelpCircle } from 'lucide-react'

export default function RightColumn() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3 mb-3">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=doctor" alt="Doctor" className="w-12 h-12 rounded-full bg-white" />
            <div>
              <p className="font-semibold">Dr Erin Grace</p>
              <p className="text-sm text-blue-100">Pediatrician</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Tuesday, July 30 | 9:00 AM-9:30 AM</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Profile</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Payment Method</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Help</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
