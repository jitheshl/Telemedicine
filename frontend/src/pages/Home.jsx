import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart, Sparkles, MessageSquare, ArrowRight, Star, Clock, AlertCircle } from 'lucide-react';
import SymptomChecker from '../components/SymptomChecker';

const Home = () => {
  const [isCheckerOpen, setIsCheckerOpen] = useState(false);

  const stats = [
    { label: 'Active Doctors', value: '150+' },
    { label: 'Happy Patients', value: '10K+' },
    { label: 'Consultations Completed', value: '25K+' },
    { label: 'AI Diagnostic Suggestions', value: '99.4%' },
  ];

  const features = [
    {
      icon: <Activity className="w-6 h-6 text-indigo-500" />,
      title: 'AI Symptom Checker',
      desc: 'Type what you are feeling and get instant advice on recommended specialties and severity rankings.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-emerald-500" />,
      title: '24/7 AI Health Chatbot',
      desc: 'Chat with Aura, our friendly medical chatbot. Ask about drug interactions, wellness tips, or portal workflows.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
      title: 'Hassle-Free Booking',
      desc: 'Browse verified profiles, choose available days, write symptoms, and secure appointments in seconds.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 bg-grid overflow-hidden">
        {/* Glow blur circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/30 text-indigo-650 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Next-Gen Telehealth System</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              AI-Powered Healthcare, <br />
              <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">Right at Your Fingertips</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Consult with board-certified physicians, evaluate symptoms instantly using AI, and receive clinical reports tailored to your recovery path.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => setIsCheckerOpen(true)}
                className="py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all glow-primary flex items-center justify-center space-x-2"
              >
                <span>Check Symptoms Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <Link
                to="/doctors"
                className="py-3.5 px-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-900 shadow-sm hover:shadow-md transition-all flex items-center justify-center"
              >
                Find & Book Doctor
              </Link>
            </div>

            {/* Micro disclaimer */}
            <div className="flex items-center space-x-2 text-[10px] text-slate-450 dark:text-slate-400">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>AI suggestions are educational and require clinical validation.</span>
            </div>
          </div>

          {/* Hero graphics block */}
          <div className="relative flex justify-center lg:justify-end animate-float">
            <div className="w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 shadow-xl shadow-slate-300/50 dark:shadow-indigo-900/30 relative overflow-hidden flex items-center justify-center p-6 border-4 border-white dark:border-slate-800">
              <div className="absolute inset-0 bg-slate-950/10 dark:bg-slate-950/30 backdrop-blur-[2px]" />
              
              {/* Glass overlay widget */}
              <div className="relative glass p-6 rounded-3xl border border-white/20 shadow-xl max-w-sm w-full space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-100">Live Doctor Availability</p>
                    <p className="text-[10px] text-slate-400">54 Doctors Online Now</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-1.5 rounded-full bg-slate-200/50 dark:bg-slate-800/40 w-full" />
                  <div className="h-1.5 rounded-full bg-slate-200/50 dark:bg-slate-800/40 w-[80%]" />
                  <div className="h-1.5 rounded-full bg-slate-200/50 dark:bg-slate-800/40 w-[95%]" />
                </div>

                <div className="pt-2 flex justify-between items-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Chat consultation enabled</span>
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

  <div className="text-center mb-5">
    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
      Demo Statistics
    </h2>
  </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white bg-gradient-to-r from-indigo-600 to-indigo-455 bg-clip-text text-transparent">
                {s.value}
              </h3>
              <p className="text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3.5 max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Smart Virtual Care Features
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Aura integrates intelligent tools directly into your care schedule, delivering accessible consultations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900/50 shadow-md hover:shadow-xl transition-all space-y-4"
            >
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 shadow-sm w-fit">
                {f.icon}
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wellness Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-indigo-900 to-slate-950 text-white shadow-xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Backdrop grid */}
          <div className="absolute inset-0 bg-grid opacity-5" />
          
          <div className="lg:col-span-3 space-y-5 relative">
            <span className="px-2.5 py-1 rounded bg-indigo-500/25 border border-indigo-400/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
              AI Health Tips
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Interact with Aura Health Coach
            </h3>
            <p className="text-sm text-slate-350 leading-relaxed">
              Have questions about physical therapy, calorie intake, stress management, or basic medicine usage? Launch our persistent chatbot Aura, available in the bottom-right corner of the application.
            </p>
          </div>

          <div className="lg:col-span-2 flex justify-center lg:justify-end relative">
            <button
              onClick={() => setIsCheckerOpen(true)}
              className="py-4 px-8 rounded-2xl bg-white hover:bg-slate-50 text-indigo-950 font-bold text-sm shadow-xl transition-all"
            >
              Test Symptom Checker Now
            </button>
          </div>
        </div>
      </section>

      {/* Symptom Checker Modal */}
      <SymptomChecker isOpen={isCheckerOpen} onClose={() => setIsCheckerOpen(false)} />
    </div>
  );
};

export default Home;
