import React, { useState } from 'react'

export default function ScheduleChangesView() {
  const [selectedDate, setSelectedDate] = useState(14)
  const [selectedTime, setSelectedTime] = useState('09:00am')

  const dates = [11, 12, 13, 14, 15]
  const times = ['08:00am', '09:00am', '01:00pm', '04:00pm', '06:00pm']

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Schedule Changes</h3>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-600 mb-3">Select Date</p>
        <div className="flex gap-2">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                selectedDate === date
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-blue-50 text-gray-700 hover:bg-blue-100'
              }`}
            >
              {date}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-600 mb-3">Select Time</p>
        <div className="grid grid-cols-2 gap-2">
          {times.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`py-3 rounded-xl font-medium transition-all ${
                selectedTime === time
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-blue-50 text-gray-700 hover:bg-blue-100'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <button className="w-full bg-linear-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all">
        Schedule Appointment
      </button>

      {/* Current Selection Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-gray-600 mb-1">Selected Slot:</p>
        <p className="font-semibold text-gray-800">
          November {selectedDate}, 2024 at {selectedTime}
        </p>
      </div>
    </div>
  )
}
