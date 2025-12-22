import React from 'react';

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            How NeuroSense Works
          </h2>
          <p className="text-xl text-slate-600">
            Simple, smart, and effective monitoring in three steps
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-linear-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Wear the Band</h3>
            <p className="text-slate-600">
              Put on the comfortable NeuroSense band equipped with advanced sensors for continuous monitoring
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-linear-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Collect Data</h3>
            <p className="text-slate-600">
              Sensors track tremors, sleep, gait, and falls, uploading data to the cloud in real-time
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-linear-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Get Insights</h3>
            <p className="text-slate-600">
              ML algorithms analyze patterns and provide early detection alerts to you and your doctor
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}