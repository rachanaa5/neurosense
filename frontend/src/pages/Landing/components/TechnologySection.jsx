import React from 'react';
import { Wifi, Activity, Brain } from 'lucide-react';

export default function TechnologySection() {
  return (
    <section id="technology" className="py-20 px-4 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Powered by Advanced Technology
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              NeuroSense combines cutting-edge hardware with machine learning to deliver accurate, real-time health monitoring.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                  <Wifi className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">ESP8266 Connectivity</h4>
                  <p className="text-slate-400">Reliable WiFi connection for seamless data transmission</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">MAX30100 & MPU6050 Sensors</h4>
                  <p className="text-slate-400">Medical-grade sensors for accurate vital sign monitoring</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Random Forest ML Algorithm</h4>
                  <p className="text-slate-400">Advanced machine learning for pattern recognition and early detection</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-linear-to-br from-indigo-600 to-blue-600 rounded-3xl p-8">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 space-y-4">
              <div className="text-sm text-indigo-200">Real-Time Data Flow</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full animate-pulse" style={{width: '85%'}}></div>
                  </div>
                  <div className="text-sm">Sensors</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full animate-pulse" style={{width: '92%'}}></div>
                  </div>
                  <div className="text-sm">Cloud</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full animate-pulse" style={{width: '78%'}}></div>
                  </div>
                  <div className="text-sm">ML Analysis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}