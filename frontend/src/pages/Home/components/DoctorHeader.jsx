import React from 'react'
import { User, FileText } from 'lucide-react'

export default function DoctorHeader() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Hello, Doctor</h1>
            <p className="text-sm text-gray-500">Welcome back</p>
          </div>
        </div>
        <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
          <FileText className="w-6 h-6 text-indigo-600" />
        </button>
      </div>
    </header>
  )
}
