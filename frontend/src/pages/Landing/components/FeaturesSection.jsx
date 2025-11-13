import React from 'react';
import { Activity, Clock, TrendingUp, Shield, Brain, Wifi } from 'lucide-react';

const features = [
  {
    icon: <Activity className="w-8 h-8" />,
    title: "Tremor Detection",
    description: "Advanced MPU6050 sensors continuously monitor movement patterns to detect early tremor signs"
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "Sleep Analysis",
    description: "Track sleep quality and patterns, key indicators in Parkinson's disease progression"
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Gait Analysis",
    description: "Monitor walking patterns and balance to identify mobility changes over time"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Fall Detection",
    description: "Immediate alerts for falls with automatic emergency notifications"
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "ML-Powered Insights",
    description: "Random Forest algorithm analyzes patterns for accurate early detection"
  },
  {
    icon: <Wifi className="w-8 h-8" />,
    title: "Real-Time Monitoring",
    description: "Cloud-connected device provides continuous data updates via ThingSpeak"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Comprehensive Health Monitoring
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our advanced wearable technology tracks multiple vital parameters to provide early detection and continuous monitoring
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-xl transition group"
            >
              <div className="w-16 h-16 bg-linear-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <div className="text-indigo-600">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}