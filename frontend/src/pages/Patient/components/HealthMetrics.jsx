import React from 'react'
import { Activity, Heart, ChevronRight, AlertCircle, Waves, Footprints, Moon } from 'lucide-react'

const RISK_STYLES = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-green-100 text-green-700',
  Unknown: 'bg-gray-100 text-gray-600',
}

const SLEEP_LABELS = { 0: 'Awake', 1: 'Light sleep', 2: 'Deep sleep' }

function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-3xl shadow-lg ${className}`}>{children}</div>
}

function Vital({ icon, iconClass, label, value, unit }) {
  const Icon = icon
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${iconClass}`} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <p className="text-4xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{unit}</p>
    </Card>
  )
}

function Panel({ icon, title, value, detail }) {
  const Icon = icon
  return (
    <Card className="p-5 hover:shadow-xl transition cursor-pointer">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-blue-500" />
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-1">{value}</p>
      <div className="flex items-center gap-2 text-blue-500 text-sm">
        <span>{detail}</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </Card>
  )
}

export default function HealthMetrics({ report, loading, error }) {
  if (loading) {
    return (
      <div className="md:col-span-2 space-y-6">
        <Card className="p-6 animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-8 w-24 bg-gray-200 rounded-full" />
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 h-36 animate-pulse" />
          <Card className="p-6 h-36 animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="md:col-span-2">
        <Card className="p-6 border border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Cannot load readings</h2>
          </div>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
        </Card>
      </div>
    )
  }

  // The device is offline, or has never written to the channel.
  if (!report || report.status === 'no_data') {
    return (
      <div className="md:col-span-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800">No readings yet</h2>
          <p className="text-sm text-gray-600 mt-2">
            The wearable has not published any data to its ThingSpeak channel.
          </p>
        </Card>
      </div>
    )
  }

  const { summary = {}, risk_level: risk = 'Unknown', readings = [] } = report
  const latest = readings[readings.length - 1] || {}

  return (
    <div className="md:col-span-2 space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">Parkinsonian Risk</h2>
          </div>
          <span className="text-xs text-gray-400">
            {summary.readings_analysed ?? 0} readings analysed
          </span>
        </div>
        <div
          className={`px-4 py-2 rounded-full inline-block font-medium ${
            RISK_STYLES[risk] || RISK_STYLES.Unknown
          }`}
        >
          {risk.toUpperCase()}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Vital
          icon={Heart}
          iconClass="text-red-500"
          label="Heart Rate"
          value={summary.avg_heart_rate ?? '--'}
          unit="bpm (average)"
        />
        <Vital
          icon={Activity}
          iconClass="text-blue-500"
          label="SpO2"
          value={summary.avg_spo2 ?? '--'}
          unit="% (average)"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Panel
          icon={Moon}
          title="Sleep"
          value={SLEEP_LABELS[latest.sleep_stage] ?? 'Unknown'}
          detail="Current stage"
        />
        <Panel
          icon={Footprints}
          title="Gait Stability"
          value={`${summary.avg_gait_score ?? '--'} / 100`}
          detail="Higher is steadier"
        />
        <Panel
          icon={Waves}
          title="Tremor"
          value={`${summary.avg_tremor_freq ?? '--'} Hz`}
          detail="Dominant frequency"
        />
      </div>

      {summary.fall_events > 0 && (
        <Card className="p-5 border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">
              {summary.fall_events} fall {summary.fall_events === 1 ? 'event' : 'events'} in
              this window
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
