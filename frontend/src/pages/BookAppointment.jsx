import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doctorAPI, appointmentAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Stethoscope, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

const BookAppointment = () => {
  const { id } = useParams(); // Doctor ID optional from URL
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(id || '');
  const [doctorDetails, setDoctorDetails] = useState(null);
  
  // Form states
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [consultType, setConsultType] = useState('video');
  const [symptoms, setSymptoms] = useState('');

  // AI Checker states during booking
  const [checkingAI, setCheckingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchDoctorDetails(selectedDoctorId);
    } else {
      setDoctorDetails(null);
    }
  }, [selectedDoctorId]);

  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const res = await doctorAPI.getAll({ limit: 100 });
      if (res.data.success) {
        setDoctorsList(res.data.doctors);
      }
    } catch (err) {
      console.error('Failed to load doctors list:', err.message);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const fetchDoctorDetails = async (docId) => {
    try {
      const res = await doctorAPI.getById(docId);
      if (res.data.success) {
        setDoctorDetails(res.data.doctor);
      }
    } catch (err) {
      console.error('Failed to load doctor profile:', err.message);
    }
  };

  const handlePreAnalyzeSymptoms = async () => {
    if (!symptoms.trim()) return;

    setCheckingAI(true);
    setAiAnalysis(null);
    try {
      const res = await aiAPI.checkSymptoms(symptoms);
      if (res.data.success) {
        setAiAnalysis(res.data.analysis);
      }
    } catch (err) {
      console.error('Pre-analysis failed:', err.message);
    } finally {
      setCheckingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctorId || !bookingDate || !bookingSlot || !symptoms) {
      setError('Please fill in all details before booking.');
      return;
    }

    setLoading(true);
    try {
      const res = await appointmentAPI.book({
        doctor: selectedDoctorId,
        date: bookingDate,
        timeSlot: bookingSlot,
        consultationType: consultType,
        symptomsDescription: symptoms,
      });

      if (res.data.success) {
        navigate('/patient-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSlots = () => {
  if (!doctorDetails?.availability || !bookingDate) return [];

  const selectedDay = new Date(bookingDate).toLocaleDateString("en-US", {
    weekday: "long",
  });

  const dayAvailability = doctorDetails.availability.find(
    (day) => day.day === selectedDay
  );

  if (!dayAvailability) return [];

  return dayAvailability.slots;
};

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="glass p-8 sm:p-10 rounded-3xl border border-slate-200/50 dark:border-slate-800/30 shadow-2xl space-y-8 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-200/50 dark:border-slate-800/30">
          <div className="p-3 rounded-2xl bg-indigo-650 text-white shadow-lg shadow-indigo-500/25">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Book Consultation</h1>
            <p className="text-xs text-slate-400">Evaluate symptoms, select appointment date, and register details.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-455 rounded-2xl text-xs border border-rose-250/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Medical Specialist</label>
            {id ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Dr. {doctorDetails?.user?.name || 'Physician'}
                  </p>
                  <p className="text-slate-400 mt-0.5">{doctorDetails?.specialization} • {doctorDetails?.hospital}</p>
                </div>
                <Link to="/doctors" className="text-indigo-600 hover:underline">Change</Link>
              </div>
            ) : (
              <select
                value={selectedDoctorId}
                onChange={(e) => {
  setSelectedDoctorId(e.target.value);
  setBookingSlot("");
}
}
                className="w-full px-3.5 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-2xl text-xs focus:outline-none"
                required
              >
                <option value="">Choose physician...</option>
                {doctorsList.map((doc) => (
                  <option key={doc.user?._id || doc._id} value={doc.user?._id || doc._id}>
                    Dr. {doc.user?.name} ({doc.specialization} - {doc.hospital})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Consultation Type */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Type</label>
              <select
                value={consultType}
                onChange={(e) => setConsultType(e.target.value)}
                className="w-full px-3 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-2xl text-xs focus:outline-none"
              >
                <option value="video">Video Consultation</option>
                <option value="chat">Chat Consultation</option>
                <option value="in-person">In-Person Clinic</option>
              </select>
            </div>

            {/* Date Select */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preferred Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
  setBookingDate(e.target.value);
  setBookingSlot("");
}}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-2xl text-xs focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Time slot select */}
            <div className="sm:col-span-3">
  <label className="block text-xs font-bold text-slate-500 uppercase mb-3">
    Available Time Slots
  </label>

  {!bookingDate ? (
    <div className="text-xs text-slate-400">
      Please select a date first.
    </div>
  ) : getAvailableSlots().length === 0 ? (
    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 text-xs">
      Doctor is unavailable on this date.
    </div>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {getAvailableSlots().map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => setBookingSlot(slot)}
          className={`py-3 rounded-xl border text-xs font-semibold transition-all ${
            bookingSlot === slot
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-500"
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  )}
</div>
          </div>

          {/* Symptoms check */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-500 uppercase">Describe Your Symptoms</label>
              <button
                type="button"
                onClick={handlePreAnalyzeSymptoms}
                disabled={checkingAI || !symptoms.trim()}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pre-Analyze Symptoms (AI)</span>
              </button>
            </div>
            
            <textarea
              value={symptoms}
              onChange={(e) => {
  setSymptoms(e.target.value);
  setAiAnalysis(null);
}}
              placeholder="Please list symptoms in detail. Example: Severe back discomfort starting yesterday, spreading to legs."
              className="w-full h-28 px-4 py-3 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
              required
            />

            {/* Pre-Analysis outcomes panel */}
            {checkingAI && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-2xl text-xs text-slate-400 flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-indigo-650 rounded-full animate-spin border-t-transparent"></span>
                <span>Gemini is evaluating symptom logs...</span>
              </div>
            )}

            {aiAnalysis && (
              <div className="p-5 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/15 border border-indigo-150/40 dark:border-indigo-900/30 space-y-3 animate-float-short text-xs">
                <h4 className="font-bold text-indigo-650 dark:text-indigo-400 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Pre-Consultation Assessment</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold text-slate-700 dark:text-slate-350">
                  <p>Severity Ranking: <span className="text-slate-900 dark:text-white font-bold">{aiAnalysis.severity}</span></p>
                  <p>Recommended Specialization: <span className="text-slate-900 dark:text-white font-bold">{aiAnalysis.suggestedSpecialization}</span></p>
                </div>
                
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {aiAnalysis.details}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !selectedDoctorId || !bookingDate || !bookingSlot || !symptoms}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></span>
            ) : (
              <>
                <span>Secure Booking Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
