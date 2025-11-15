import React from 'react'
import { Bell, Heart } from 'lucide-react'

export default function PatientHeader({ activeTab, setActiveTab }) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Hello,</p>
            <p className="font-semibold text-gray-800">Mr. Patient</p>
          </div>
        </div>

        <nav className="hidden md:flex gap-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-blue-50'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'appointments' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-blue-50'}`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-blue-50'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-blue-50'}`}
          >
            Settings
          </button>
        </nav>

        <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-500 transition" />
      </div>
    </header>
  )
}
