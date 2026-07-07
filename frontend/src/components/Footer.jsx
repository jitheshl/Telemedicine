import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Mail, Phone, MapPin, Twitter, Facebook, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-20 border-t border-slate-200/50 dark:border-slate-800/30 bg-slate-50/50 dark:bg-slate-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Aura<span className="text-indigo-500">Telemed</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Empowering healthcare accessibility through modern AI-assisted diagnosis and real-time medical consultations. Available 24/7.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-850 hover:bg-indigo-50 hover:text-indigo-500 dark:hover:bg-indigo-950/30 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-850 hover:bg-indigo-50 hover:text-indigo-500 dark:hover:bg-indigo-950/30 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-850 hover:bg-indigo-50 hover:text-indigo-500 dark:hover:bg-indigo-950/30 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white uppercase tracking-wider mb-5">
              Platform Links
            </h3>
            <ul className="space-y-3.5">
              <li>
                <Link to="/" className="text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  About the Portal
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  Our Specialties
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  Search Doctors
                </Link>
              </li>
            </ul>
          </div>

          {/* Support / Legal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white uppercase tracking-wider mb-5">
              Healthcare Info
            </h3>
            <ul className="space-y-3.5">
              <li>
                <Link to="/doctors" className="text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  Book Consultation
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white uppercase tracking-wider mb-5">
              Get in touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <span>100 Health Avenue, Suite 500, Medical City, MC 90210</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>+1 (555) 234-5678</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>support@auratelemed.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200/50 dark:border-slate-800/30 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} AuraTelemed Inc. All rights reserved.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 mx-1 fill-rose-500" /> for accessible healthcare.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
