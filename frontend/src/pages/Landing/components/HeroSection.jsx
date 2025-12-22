import React from 'react';
import { Activity, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                Early Detection • Real-Time Monitoring
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              Detect Parkinson's
              <span className="block bg-linear-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Before It's Too Late
              </span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              NeuroSense is a wearable smart band that continuously monitors vital health parameters using advanced sensors and machine learning to detect early signs of Parkinson's disease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-1 transition flex items-center justify-center gap-2" onClick={() => navigate('/signup')}>
                Start Monitoring
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:border-indigo-600 hover:text-indigo-600 transition">
                Learn More
              </button>
            </div>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-indigo-600">24/7</div>
                <div className="text-slate-600 text-sm">Monitoring</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600">95%</div>
                <div className="text-slate-600 text-sm">Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600">Real-Time</div>
                <div className="text-slate-600 text-sm">Updates</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-indigo-300 to-blue-300 rounded-3xl blur-3xl opacity-30"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-indigo-600" />
                    <div>
                      <div className="text-sm text-slate-600">Tremor Level</div>
                      <div className="text-xl font-bold text-slate-900">Normal</div>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-green-500"></div>
                  </div>
                </div>
                {/* ...other cards omitted for brevity... */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}