import React from 'react';
import { Brain } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">NeuroSense</span>
        </div>
        <p className="text-slate-400 mb-6">
          Early detection. Better outcomes. Peace of mind.
        </p>
        <p className="text-slate-500 text-sm">
          © 2025 NeuroSense. All rights reserved.
        </p>
      </div>
    </footer>
  );
}