import React, { useState, useEffect } from 'react';
import { Brain, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-linear-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              NeuroSense
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-700 hover:text-indigo-600 transition">Features</a>
            <a href="#how-it-works" className="text-slate-700 hover:text-indigo-600 transition">How It Works</a>
            <a href="#technology" className="text-slate-700 hover:text-indigo-600 transition">Technology</a>
            <button className="px-6 py-2.5 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition" onClick={() => navigate('/signup')}>
              Get Started
            </button>
          </div>
          <button className="md:hidden text-slate-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <a href="#features" className="block text-slate-700 hover:text-indigo-600 py-2">Features</a>
            <a href="#how-it-works" className="block text-slate-700 hover:text-indigo-600 py-2">How It Works</a>
            <a href="#technology" className="block text-slate-700 hover:text-indigo-600 py-2">Technology</a>
            <button className="w-full px-6 py-2.5 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-lg" onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }}>
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}