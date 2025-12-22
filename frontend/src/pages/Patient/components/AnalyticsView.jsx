import React from 'react'

export default function AnalyticsView() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-blue-600">Sleep Analysis</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Sleep Last Night</p>
          <p className="text-3xl font-bold text-gray-800">12 Hrs</p>
        </div>
        <div className="h-48 flex items-end justify-between gap-2">
          {[5, 7, 6, 8, 7, 6, 5].map((h, i) => (
            <div key={i} className="flex-1 bg-blue-200 rounded-t-lg" style={{height: `${h * 10}%`}}></div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-blue-600">Fall Analysis</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Falls This Week</p>
          <p className="text-3xl font-bold text-gray-800">6</p>
        </div>
        <div className="h-48 flex items-end justify-between gap-2">
          {[2, 3, 2, 4, 3, 2, 3].map((h, i) => (
            <div key={i} className="flex-1 bg-purple-200 rounded-t-lg" style={{height: `${h * 15}%`}}></div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0h</span>
          <span>2nd</span>
          <span>3rd</span>
          <span>4th</span>
          <span>5th</span>
          <span>6th</span>
          <span>6th+</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-blue-600">Tremor Intensity</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Overall Status</p>
        </div>
        <div className="h-48 flex items-end justify-center gap-4">
          <div className="w-16">
            <div className="bg-red-500 rounded-t-lg mb-2" style={{height: '120px'}}></div>
            <p className="text-xs text-center text-gray-600">High</p>
          </div>
          <div className="w-16">
            <div className="bg-gray-400 rounded-t-lg mb-2" style={{height: '80px'}}></div>
            <p className="text-xs text-center text-gray-600">Moderate</p>
          </div>
          <div className="w-16">
            <div className="bg-gray-400 rounded-t-lg mb-2" style={{height: '60px'}}></div>
            <p className="text-xs text-center text-gray-600">Low</p>
          </div>
        </div>
      </div>
    </div>
  )
}
