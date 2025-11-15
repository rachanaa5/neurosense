import React from 'react'
import { Calendar, FileText, Edit } from 'lucide-react'

export default function NavigationTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'appointments', label: 'Scheduled Appointments', icon: Calendar },
    { id: 'notes', label: 'Medical Notes', icon: FileText },
    { id: 'changes', label: 'Schedule Changes', icon: Edit },
  ]

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-2">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-transparent text-gray-700 hover:bg-blue-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
