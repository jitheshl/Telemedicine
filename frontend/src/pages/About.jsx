import React from 'react';
import { Shield, Sparkles, Heart, Activity } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Intro */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          About AuraTelemed
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          We bridge the gap between AI automation and clinical expertise, bringing reliable health assessment and medical consultations directly to your home.
        </p>
      </section>

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Vision & Mission</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Healthcare should not be gated behind long queues, heavy administration, or location barriers. AuraTelemed provides immediate triage using state-of-the-art LLM technologies, alongside instant access to verified human medical professionals.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            By analyzing symptoms first and suggesting appropriate medical specializations, we save critical screening time, reduce diagnostic overhead, and ensure you get correct advice the first time.
          </p>
        </div>

        <div className="p-8 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
            <Heart className="w-6 h-6 text-rose-500 mb-2" />
            <h4 className="font-bold text-xs">Patient Centric</h4>
            <p className="text-[10px] text-slate-400 mt-1">Every clinical report and tip is customized to individual files.</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
            <Sparkles className="w-6 h-6 text-yellow-500 mb-2" />
            <h4 className="font-bold text-xs">AI Augmented</h4>
            <p className="text-[10px] text-slate-400 mt-1">Assisting diagnostic routing using Gemini AI models.</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
            <Shield className="w-6 h-6 text-indigo-500 mb-2" />
            <h4 className="font-bold text-xs">Secure Records</h4>
            <p className="text-[10px] text-slate-400 mt-1">Full compliance using encrypted JWT verification protocols.</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
            <Activity className="w-6 h-6 text-emerald-500 mb-2" />
            <h4 className="font-bold text-xs">24/7 Triage</h4>
            <p className="text-[10px] text-slate-400 mt-1">Interactive chatbot support active day and night.</p>
          </div>
        </div>
      </section>

      {/* Ethics Callout */}
      <section className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden text-center max-w-4xl mx-auto space-y-4">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <h3 className="text-xl font-bold">Responsible AI Policy</h3>
        <p className="text-xs text-slate-350 leading-relaxed max-w-2xl mx-auto">
          We strictly follow ethical guidelines for medical automation. Aura AI is a support tool trained to catalog symptoms and draft consultation recaps based on doctor notes. AI never prescribes medicines or overrides clinical determinations made by licensed physicians.
        </p>
      </section>
    </div>
  );
};

export default About;
