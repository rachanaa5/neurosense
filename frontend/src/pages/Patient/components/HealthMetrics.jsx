import React from 'react'
import { Activity, Heart, ChevronRight } from 'lucide-react'

export default function HealthMetrics() {
  return (
    <div className="md:col-span-2 space-y-6">
      {/* Risk Assessment */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">Parkinson's Risk</h2>
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full inline-block font-medium">
          LOW
        </div>
      </div>

      {/* Vital Signs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600">Heart Rate</span>
          </div>
          <p className="text-4xl font-bold text-gray-800">96.7</p>
          <p className="text-sm text-gray-500 mt-1">bpm</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">SpO2 Rate</span>
          </div>
          <p className="text-4xl font-bold text-gray-800">96.7</p>
          <p className="text-sm text-gray-500 mt-1">%</p>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-lg hover:shadow-xl transition cursor-pointer">
          <h3 className="font-semibold text-gray-800 mb-2">Sleep Analysis</h3>
          <p className="text-sm text-gray-600 mb-1">7 hrs</p>
          <div className="flex items-center gap-2 text-blue-500 text-sm">
            <span>View Details</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-lg hover:shadow-xl transition cursor-pointer">
          <h3 className="font-semibold text-gray-800 mb-2">Fall Analysis</h3>
          <p className="text-sm text-gray-600 mb-1">6 falls this week</p>
          <div className="flex items-center gap-2 text-blue-500 text-sm">
            <span>View Details</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-lg hover:shadow-xl transition cursor-pointer">
          <h3 className="font-semibold text-gray-800 mb-2">Tremor Intensity</h3>
          <p className="text-sm text-gray-600 mb-1">Moderate</p>
          <div className="flex items-center gap-2 text-blue-500 text-sm">
            <span>View Details</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
