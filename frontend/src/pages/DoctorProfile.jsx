import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { Star, MapPin, Hospital, GraduationCap, Calendar, Clock, Sparkles } from 'lucide-react';

const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const res = await doctorAPI.getById(id);
        if (res.data.success) {
          setDoctor(res.data.doctor);
          setReviews(res.data.reviews || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="w-8 h-8 border-3 border-indigo-650 rounded-full animate-spin border-t-transparent"></span>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <p className="text-sm text-slate-500 font-bold">{error || 'Doctor profile not found'}</p>
        <Link to="/doctors" className="text-xs text-indigo-600 hover:underline">Return to Find Doctors</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Overview Header banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-900 shadow-md relative overflow-hidden flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Glow blur background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />

        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-3xl uppercase shadow-md shrink-0">
          {doctor.user ? doctor.user.name.charAt(0) : 'D'}
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Dr. {doctor.user ? doctor.user.name : 'Physician'}
            </h1>
            {doctor.isVerified && (
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-450 text-[9px] font-bold tracking-wider uppercase">Verified Professional</span>
            )}
          </div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {doctor.specialization}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Hospital className="w-4 h-4 text-indigo-500" />
              <span>{doctor.hospital}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-indigo-500" />
              <span>{doctor.user?.location || 'General Area'}</span>
            </span>
          </div>
        </div>

        <div className="w-full md:w-auto shrink-0 flex flex-col items-stretch sm:items-start gap-2.5">
          <div className="flex items-center space-x-1">
            <Star className="w-5 h-5 text-yellow-450 fill-yellow-450" />
            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
              {doctor.averageRating || '5.0'}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              ({doctor.totalReviews || 0} reviews)
            </span>
          </div>
          <Link
            to={`/book/${doctor.user?._id || doctor._id}`}
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs text-center shadow-lg shadow-indigo-600/10 glow-primary transition-all"
          >
            Schedule Consultation
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details & Availability */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Biography */}
          <div className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Biography</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {doctor.user?.bio || `Dr. ${doctor.user ? doctor.user.name : 'Physician'} is a dedicated practitioner with ${doctor.experience} years of clinical experience in ${doctor.specialization}. They specialize in diagnosing complex conditions and providing personalized lifestyle advice.`}
            </p>
          </div>

          {/* Qualifications */}
          <div className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Qualifications & Degrees</h3>
            <div className="flex flex-wrap gap-2">
              {doctor.qualifications?.map((qual, idx) => (
                <div key={idx} className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{qual}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Weekly Availability</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctor.availability?.map((avail, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-2">
                  <p className="font-bold text-xs text-slate-855 dark:text-slate-200 flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>{avail.day}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {avail.slots.map((slot, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-800/50 text-[10px] text-slate-550 dark:text-slate-400 font-semibold rounded-lg flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        <span>{slot}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Reviews */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-6">Patient Reviews</h3>
            
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No patient reviews submitted yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{rev.patientName}</p>
                      <div className="flex items-center text-xs text-yellow-450 font-bold space-x-0.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400">{new Date(rev.date).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorProfile;
