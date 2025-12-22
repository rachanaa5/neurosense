import React from 'react'
import { User, Calendar, Clock } from 'lucide-react'

export default function ScheduledAppointments() {
  const appointments = [
    {
      id: 1,
      doctor: 'Dr Ellen Grace',
      specialty: 'Neurologist',
      date: 'Tuesday, July 30',
      time: '9:00 AM - 9:30 AM',
      status: 'Confirmed',
      color: 'bg-green-500'
    },
    {
      id: 2,
      doctor: 'Dr. John Smith',
      specialty: 'Cardiologist',
      date: 'Wednesday, July 31',
      time: '2:00 PM - 2:30 PM',
      status: 'Pending',
      color: 'bg-yellow-500'
    },
    {
      id: 3,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'General Physician',
      date: 'Friday, August 2',
      time: '10:00 AM - 10:30 AM',
      status: 'Confirmed',
      color: 'bg-green-500'
    },
  ]

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Scheduled Appointments</h3>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-linear-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{appointment.doctor}</p>
                  <p className="text-sm text-gray-600">{appointment.specialty}</p>
                </div>
              </div>
              <span className={`${appointment.color} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                {appointment.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>{appointment.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
