import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-6">
          Ready to Start Your Health Journey?
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          Join patients and doctors who trust NeuroSense for early detection and continuous monitoring
        </p>
        <button className="px-10 py-4 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-lg font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition" onClick={() => navigate('/signup')}>
          Get Started Now
        </button>
      </div>
    </section>
  );
}