import React, { useEffect, useState } from 'react';
import { adminAPI, supportAPI } from '../services/api';
import { Shield, Users, DollarSign, Calendar, Star, CheckCircle, AlertTriangle, ShieldCheck, Stethoscope } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState([]);
const [selectedTicket, setSelectedTicket] = useState(null);
const [reply, setReply] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const statsRes = await adminAPI.getAnalytics();
      const doctorsRes = await adminAPI.getDoctors();
      const ticketsRes = await supportAPI.getAllTickets();
      
      if (statsRes.data.success && doctorsRes.data.success &&  ticketsRes.data.success) {
        setStats(statsRes.data.stats);
        setDoctors(doctorsRes.data.doctors);
        setTickets(ticketsRes.data.tickets);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administration controls.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerify = async (doctorId) => {
    try {
      const res = await adminAPI.verifyDoctor(doctorId);
      if (res.data.success) {
        // Toggle in local doctors state
        setDoctors((prev) =>
          prev.map((doc) =>
            doc.user._id === doctorId
              ? { ...doc, isVerified: !doc.isVerified }
              : doc
          )
        );
        
        // Reload analytics stats to reflect changes
        const statsRes = await adminAPI.getAnalytics();
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
      }
    } catch (err) {
      console.error('Verification toggle failed:', err.message);
    }
  };
  const handleReply = async () => {
  try {
    const res = await supportAPI.reply(selectedTicket._id, reply);

    if (res.data.success) {
      alert("Reply sent successfully!");

      fetchAdminData();

      setSelectedTicket(null);
      setReply("");
    }

  } catch (err) {
    console.error(err);
    alert("Failed to send reply");
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <span className="w-8 h-8 border-3 border-indigo-600 rounded-full animate-spin border-t-transparent"></span>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <Shield className="w-8 h-8 text-indigo-500" />
            <span>Admin Portal Controls</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Review system analytics, manage medical specialties, and verify doctors.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-455 rounded-2xl text-sm border border-rose-250/30">
          {error}
        </div>
      )}

      {/* Analytics Widgets */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Registered Users</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.users.total}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Patients: {stats.users.patients} • Doctors: {stats.users.doctors}</p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Consultations</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.appointments.total}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Confirmed: {stats.appointments.confirmed} • Completed: {stats.appointments.completed}</p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-655 dark:text-indigo-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Portal Revenue (Fills)</p>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${stats.revenue}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Based on doctor fees of completed sessions</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Cancelled Bookings</p>
                <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-455 mt-1">{stats.appointments.cancelled}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Pending: {stats.appointments.pending}</p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Specialization Breakdown Chart representation */}
      {stats && stats.specializations && (
        <div className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-lg">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-indigo-500" />
            <span>Specialty Distribution Analytics</span>
          </h3>
          
          <div className="space-y-4">
            {Object.entries(stats.specializations).map(([spec, count]) => {
              const totalDocs = stats.users.doctors || 1;
              const percentage = Math.round((count / totalDocs) * 100);
              return (
                <div key={spec} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-350">
                    <span>{spec}</span>
                    <span>{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-650 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Doctor verification controller table */}
      <div className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-lg">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
          <ShieldCheck className="w-4.5 h-4.5 text-indigo-500" />
          <span>Doctor Verification Credentials List</span>
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950">
          <table className="min-w-full divide-y divide-slate-150 dark:divide-slate-850 text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4">Fee</th>
                <th className="px-6 py-4">Hospital</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
              {doctors.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    Dr. {doc.user?.name || 'Deleted User'}
                    <p className="text-[10px] text-slate-400 font-normal">{doc.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold">{doc.specialization}</td>
                  <td className="px-6 py-4">{doc.experience} years</td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-450">${doc.consultationFee}</td>
                  <td className="px-6 py-4 text-slate-500">{doc.hospital}</td>
                  <td className="px-6 py-4">
                    {doc.isVerified ? (
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">Verified</span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">Unverified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleVerify(doc.user?._id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase transition-colors ${
                        doc.isVerified
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                      }`}
                    >
                      {doc.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
            </div>

      {/* Support Tickets */}

      <div className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-lg">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          <span>Support Tickets</span>
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950">
          <table className="min-w-full divide-y divide-slate-150 dark:divide-slate-850 text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="px-6 py-4 text-left">Patient</th>
                <th className="px-6 py-4 text-left">Subject</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td className="px-6 py-4">
                    {ticket.name}
                    <p className="text-[10px] text-slate-400">
                      {ticket.email}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    {ticket.subject}
                  </td>

                  <td className="px-6 py-4">
                    {ticket.status}
                  </td>

                  <td className="px-6 py-4">
                    <button
  onClick={() => {
    setSelectedTicket(ticket);
    setReply(ticket.adminReply || "");
  }}
  className="bg-indigo-600 text-white px-3 py-2 rounded-lg"
>
  View
</button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

  </div>

  {selectedTicket && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-[600px]">

        <h2 className="text-xl font-bold mb-4">
          Support Ticket
        </h2>

        <p><b>Name:</b> {selectedTicket.name}</p>
        <p><b>Email:</b> {selectedTicket.email}</p>
        <p><b>Subject:</b> {selectedTicket.subject}</p>

        <div className="mt-4">
          <b>Message</b>

          <div className="border rounded-lg p-3 mt-2">
            {selectedTicket.message}
          </div>
        </div>

        <textarea
          value={reply}
          onChange={(e)=>setReply(e.target.value)}
          className="w-full border rounded-lg mt-4 p-3"
          rows={5}
          placeholder="Write your reply..."
        />

        <div className="flex justify-end gap-3 mt-5">

          <button
            onClick={()=>setSelectedTicket(null)}
            className="px-4 py-2 rounded-lg bg-gray-500 text-white"
          >
            Close
          </button>

          <button
            onClick={handleReply}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
          >
            Send Reply
          </button>

        </div>

      </div>
    </div>
  )}
</>

);
};

export default AdminDashboard;
