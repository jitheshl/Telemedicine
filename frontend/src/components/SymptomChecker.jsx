import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAPI } from '../services/api';
import { X, Sparkles, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';

const SymptomChecker = ({ isOpen, onClose }) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    try {
      const res = await aiAPI.checkSymptoms(symptoms);
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (error) {
      console.error('Symptom analysis error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookDoctor = (doctorId) => {
    onClose();
    navigate(`/book/${doctorId}`);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-200 dark:border-rose-900/30';
      case 'Medium':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 border-amber-200 dark:border-amber-900/30';
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border-emerald-200 dark:border-emerald-900/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/30 overflow-hidden flex flex-col max-h-[90vh] animate-float-short">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/30 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-indigo-100/10 dark:from-indigo-950/20 dark:to-transparent">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">AI Symptom Assistant</h3>
              <p className="text-xs text-slate-400">Instant wellness checking powered by Gemini</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-355 mb-2">
                  Describe what you are feeling:
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="E.g., I have had a dull headache for three days, accompanied by slight dizziness and nausea after meals."
                  className="w-full h-36 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 focus:outline-none focus:border-indigo-500 text-sm leading-relaxed"
                  required
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20 flex items-start space-x-3 text-xs text-amber-700 dark:text-amber-450">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Disclaimer: This tool provides screening information and suggested medical specialties based on description. It does not replace a clinical checkup. If you have emergency symptoms, go to the nearest emergency ward.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !symptoms.trim()}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/10 glow-primary"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></span>
                    <span>Analyzing symptoms...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Symptoms</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Severity & Specialty Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border ${getSeverityColor(result.analysis.severity)}`}>
                  <p className="text-xs uppercase font-bold tracking-wider opacity-60">Reported Urgency</p>
                  <p className="text-xl font-bold mt-1">{result.analysis.severity} Severity</p>
                </div>
                
                <div className="p-5 rounded-2xl border border-indigo-150 dark:border-indigo-950/50 bg-indigo-50/30 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400">
                  <p className="text-xs uppercase font-bold tracking-wider opacity-60">Suggested Specialist</p>
                  <p className="text-xl font-bold mt-1">{result.analysis.suggestedSpecialization}</p>
                </div>
              </div>

              {/* Technical clinical reasoning explanation */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2">AI Clinical Assessment:</h4>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                  {result.analysis.details}
                </p>
              </div>

              {/* Recommended Doctors list */}
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4">
                  Recommended matching {result.analysis.suggestedSpecialization}s:
                </h4>
                
                <div className="space-y-3.5">
                  {result.recommendedDoctors.map((doc) => (
                    <div 
                      key={doc._id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                          {doc.user ? doc.user.name.charAt(0) : 'D'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            Dr. {doc.user ? doc.user.name : 'Unknown Doctor'}
                          </p>
                          <p className="text-xs text-slate-400">{doc.specialization} • {doc.hospital}</p>
                          <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold mt-0.5">
                            Fee: ${doc.consultationFee || doc.user?.consultationFee}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBookDoctor(doc.user?._id || doc._id)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-955 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Book Slot</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-250 dark:border-slate-750 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Check another symptom
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors"
                >
                  Close Assistant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
