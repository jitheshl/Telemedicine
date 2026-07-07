import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { Search, SlidersHorizontal, Star, Briefcase, MapPin, DollarSign, Award, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import SymptomChecker from '../components/SymptomChecker';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [isCheckerOpen, setIsCheckerOpen] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [specialization, minRating, maxFee, page]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 6,
        specialization,
        minRating,
        maxFee,
        search,
      };
      const res = await doctorAPI.getAll(params);
      if (res.data.success) {
        setDoctors(res.data.doctors);
        setTotalPages(res.data.totalPages);
        setTotalDoctors(res.data.totalDoctors);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSpecialization('');
    setMinRating('');
    setMaxFee('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title Header with AI helper */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 sm:p-8 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-lg">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Find Your Medical Specialist
          </h1>
          <p className="text-sm text-slate-400 mt-1">Browse verified clinic reviews, compare consultation fees, and book slots.</p>
        </div>
        <button
          onClick={() => setIsCheckerOpen(true)}
          className="w-full md:w-auto px-4.5 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-indigo-200/20"
        >
          <Activity className="w-4 h-4" />
          <span>Match Specialty via AI</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctors by name, hospital location, or keyword..."
              className="block w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters Select row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-500 mb-1.5 uppercase font-bold text-[9px] tracking-wider">Specialty</label>
            <select
              value={specialization}
              onChange={(e) => { setSpecialization(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Specialties</option>
              <option value="General Physician">General Physician</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Gastroenterologist">Gastroenterologist</option>
              <option value="Orthopedist">Orthopedist</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Psychiatrist">Psychiatrist</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1.5 uppercase font-bold text-[9px] tracking-wider">Rating</label>
            <select
              value={minRating}
              onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Ratings</option>
              <option value="4">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1.5 uppercase font-bold text-[9px] tracking-wider">Max Consultation Fee ($)</label>
            <input
              type="number"
              value={maxFee}
              onChange={(e) => { setMaxFee(e.target.value); setPage(1); }}
              placeholder="E.g., 100"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-300 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Grid count display */}
      <div className="text-xs text-slate-400 font-bold uppercase tracking-wide">
        Found {totalDoctors} Doctors matching search parameters
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="w-8 h-8 border-3 border-indigo-650 rounded-full animate-spin border-t-transparent"></span>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/30">
          <p className="text-sm font-bold text-slate-650 dark:text-slate-300">No medical professionals match your current filter parameters.</p>
          <button onClick={handleClearFilters} className="text-xs text-indigo-600 hover:underline mt-2 font-semibold">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-900 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-900/50 shadow-sm transition-all flex flex-col justify-between space-y-4"
            >
              {/* Doctor Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg uppercase shadow-inner shadow-black/10">
                    {doc.user ? doc.user.name.charAt(0) : 'D'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span>Dr. {doc.user ? doc.user.name : 'Doctor'}</span>
                      {doc.isVerified && (
                        <span className="inline-flex px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 text-[8px] font-bold tracking-wider uppercase">Verified</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">{doc.specialization} • {doc.hospital}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-900/50 text-[10px] text-center font-bold text-slate-500">
                  <div className="space-y-0.5">
                    <p className="uppercase text-[8px] opacity-60">Experience</p>
                    <p className="text-slate-800 dark:text-slate-200">{doc.experience} years</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="uppercase text-[8px] opacity-60">Consult Fee</p>
                    <p className="text-emerald-650 dark:text-emerald-400">${doc.consultationFee}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="uppercase text-[8px] opacity-60">Avg Rating</p>
                    <p className="text-slate-800 dark:text-slate-200 flex items-center justify-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-0.5" />
                      <span>{doc.averageRating > 0 ? doc.averageRating : '5.0'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to={`/doctors/${doc.user?._id || doc._id}`}
                  className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  View Profile
                </Link>
                <Link
                  to={`/book/${doc.user?._id || doc._id}`}
                  className="py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-500 text-center font-bold text-xs text-white shadow-md shadow-indigo-600/10 transition-colors"
                >
                  Book Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-50 text-slate-550 dark:text-slate-400 hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-50 text-slate-550 dark:text-slate-400 hover:bg-slate-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* AI Symptom checker modal trigger */}
      <SymptomChecker isOpen={isCheckerOpen} onClose={() => setIsCheckerOpen(false)} />
    </div>
  );
};

export default Doctors;
