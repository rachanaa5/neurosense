import React from 'react'
import { Bell, Lock, User, ChevronRight } from 'lucide-react'

export default function SettingsView({ notifications, toggleNotification }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h2>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-blue-50 transition">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Notification Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-blue-50 transition">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Password Manager</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-blue-50 transition text-red-500">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5" />
              <span>Delete Account</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Notification Settings</h2>
        <div className="space-y-4">
          {Object.entries({
            general: 'General Notification',
            sound: 'Sound',
            soundCall: 'Sound Call',
            vibrate: 'Vibrate',
            specialOffers: 'Special Offers',
            payments: 'Payments',
            promoDiscount: 'Promo And Discount',
            cashback: 'Cashback'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-3">
              <span className="text-gray-700">{label}</span>
              <button
                onClick={() => toggleNotification(key)}
                className={`w-12 h-6 rounded-full transition ${
                  notifications[key] ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  notifications[key] ? 'translate-x-6' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
