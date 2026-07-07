import React from 'react';
import { Activity, ShieldCheck, Heart, Sparkles, MessageSquare, ClipboardCheck, Video, HelpCircle } from 'lucide-react';

const Services = () => {
  const specialties = [
    { title: 'General Physician', desc: 'Primary care, viral checkups, prescription renewals, and overall health monitoring.' },
    { title: 'Cardiologist', desc: 'Cardiovascular assessment, blood pressure tracking, and heart condition management.' },
    { title: 'Neurologist', desc: 'Migraine triage, nerve irritation screening, and brain health assessments.' },
    { title: 'Dermatologist', desc: 'Acne, skin allergies, eczema management, and cosmetic health guidance.' },
    { title: 'Gastroenterologist', desc: 'Digestive ailments, abdominal discomfort, acid reflux, and bowel monitoring.' },
    { title: 'Psychiatrist', desc: 'Mental health, anxiety management, chronic stress coaching, and depression support.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Intro */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Our Specialities & Services
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Access specialized diagnostic advice and video consultation across major clinical categories.
        </p>
      </section>

      {/* Specialties grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {specialties.map((spec, index) => (
          <div key={index} className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-900/50 hover:shadow-xl transition-all space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{spec.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{spec.desc}</p>
          </div>
        ))}
      </section>

      {/* Booking guide */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-3xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 items-center">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-slate-950 dark:text-white">How does clinical routing work?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Unsure which department fits your active symptoms? Simply open our **AI Symptom Checker** modal on the Home page or booking panel, write your condition details, and let our LLM engine immediately match you to the correct department and verify doctor availability.
          </p>
        </div>
        <div className="flex md:justify-end">
          <a href="/" className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md">
            Start AI Symptom Checker
          </a>
        </div>
      </section>
    </div>
  );
};

export default Services;
