import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, authAPI, doctorAPI, supportAPI } from '../services/api';
import { Calendar, Clock, Award, Star, Activity, Plus, FileText, CheckCircle, XCircle, AlertCircle, Edit } from 'lucide-react';
import SymptomChecker from '../components/SymptomChecker';
import socket from "../services/socket";

const PatientDashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckerOpen, setIsCheckerOpen] = useState(false);
  
  // Profile edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [allergiesText, setAllergiesText] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [medicationsText, setMedicationsText] = useState('');
  const [bloodGroup, setBloodGroup] = useState('Unknown');
  const [gender, setGender] = useState('Prefer not to say');

  // Review states
  const [reviewAppId, setReviewAppId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Selected Summary
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchAppointments();
     fetchTickets();
    if (profile?.medicalHistory) {
      setAllergiesText(profile.medicalHistory.allergies?.join(', ') || '');
      setConditionsText(profile.medicalHistory.chronicConditions?.join(', ') || '');
      setMedicationsText(profile.medicalHistory.currentMedications?.join(', ') || '');
      setBloodGroup(profile.bloodGroup || 'Unknown');
      setGender(profile.gender || 'Prefer not to say');
    }
  }, [profile]);

  useEffect(() => {
  socket.connect();

  socket.on("connect", () => {
    console.log("Patient Connected:", socket.id);
  });

  return () => {
    socket.off("connect");
    socket.disconnect();
  };
}, []);

  const fetchTickets = async () => {
  try {
    const res = await supportAPI.getMyTickets();

    if (res.data.success) {
      setTickets(res.data.tickets);
    }
  } catch (err) {
    console.error("Failed to load tickets:", err);
  }
};

  const fetchAppointments = async () => {
    try {
      const res = await appointmentAPI.getPatientAppointments();
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        gender,
        bloodGroup,
        medicalHistory: {
          allergies: allergiesText.split(',').map(x => x.trim()).filter(Boolean),
          chronicConditions: conditionsText.split(',').map(x => x.trim()).filter(Boolean),
          currentMedications: medicationsText.split(',').map(x => x.trim()).filter(Boolean),
        }
      };
      const res = await authAPI.updateProfile(updatedData);
      if (res.data.success) {
        refreshProfile();
        setShowEditModal(false);
      }
    } catch (err) {
      console.error('Profile update failed:', err.message);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await appointmentAPI.updateStatus(id, 'cancelled');
      if (res.data.success) {
        fetchAppointments();
      }
    } catch (err) {
      console.error('Failed to cancel:', err.message);
    }
  };

  const handlePayment = async (id) => {
  if (!window.confirm("Proceed with payment?")) return;

  try {
    const res = await appointmentAPI.payAppointment(id);

    if (res.data.success) {
      alert("Payment Successful ✅");
      fetchAppointments();
    }

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Payment failed");
  }
};

  const handlePostReview = async (e) => {
    e.preventDefault();
    try {
      const res = await doctorAPI.addReview(reviewAppId, {
        rating: Number(reviewRating),
        comment: reviewComment
      });
      if (res.data.success) {
        setReviewAppId(null);
        setReviewComment('');
        fetchAppointments();
      }
    } catch (err) {
      console.error('Review submit failed:', err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/30">Confirmed</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/30">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-650 dark:text-rose-450 rounded-full border border-rose-100 dark:border-rose-900/30">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700/50">Pending Approval</span>;
    }
  };

  // Helper to format messages with lists and bolding
  const formatMarkdown = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, index) => {
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const italicRegex = /\*(.*?)\*/g;

      formattedLine = formattedLine.replace(boldRegex, '<strong>$1</strong>');
      formattedLine = formattedLine.replace(italicRegex, '<em>$1</em>');

      if (line.startsWith('### ')) {
        return <h4 key={index} className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2">{line.substring(4)}</h4>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li 
            key={index} 
            className="ml-4 list-disc mt-1 text-xs text-slate-600 dark:text-slate-350"
            dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }}
          />
        );
      }
      return (
        <p 
          key={index} 
          className="mt-1 text-xs text-slate-600 dark:text-slate-350 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 sm:p-8 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-lg">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hello, {user?.name || 'Patient'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage your health logs, check symptoms, and review consultations.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setIsCheckerOpen(true)}
            className="flex-1 sm:flex-none px-4.5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-650/15 glow-primary transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>AI Symptom Checker</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Medical History Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                <span>Medical Dashboard</span>
              </h3>
              <button
                onClick={() => setShowEditModal(true)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Blood Group</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{profile?.bloodGroup || 'Unknown'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Gender</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.gender || 'Other'}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Allergies</h4>
                  {profile?.medicalHistory?.allergies?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {profile.medicalHistory.allergies.map((allergy, i) => (
                        <span key={i} className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg">{allergy}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1 italic">No allergies recorded</p>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-455 uppercase tracking-wider">Chronic Conditions</h4>
                  {profile?.medicalHistory?.chronicConditions?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {profile.medicalHistory.chronicConditions.map((cond, i) => (
                        <span key={i} className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg">{cond}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1 italic">No chronic conditions</p>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-455 uppercase tracking-wider">Active Medications</h4>
                  {profile?.medicalHistory?.currentMedications?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {profile.medicalHistory.currentMedications.map((med, i) => (
                        <span key={i} className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 rounded-lg">{med}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1 italic">No current medications</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Appointment booking list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-lg">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>Consultation Bookings</span>
            </h3>

            {loading ? (
              <div className="flex justify-center py-12">
                <span className="w-8 h-8 border-3 border-indigo-650 rounded-full animate-spin border-t-transparent"></span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">No appointments scheduled</p>
                  <p className="text-xs text-slate-400 mt-0.5">Find a doctor and book your consultation to get started.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((app) => (
                  <div
                    key={app._id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm relative space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3.5 border-b border-slate-100 dark:border-slate-900">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                          {app.doctorProfile?.specialization?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            Dr. {app.doctor?.name || 'Deleted Doctor'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {app.doctorProfile?.specialization || 'Specialist'} • {app.doctorProfile?.hospital || 'Clinic'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(app.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-slate-400 uppercase font-bold text-[9px]">Date</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          {new Date(app.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 uppercase font-bold text-[9px]">Time Slot</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{app.timeSlot}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 uppercase font-bold text-[9px]">Type</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-350 capitalize mt-0.5">{app.consultationType}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 uppercase font-bold text-[9px]">AI Urgency</p>
                        <p className="font-semibold text-indigo-500 dark:text-indigo-400 mt-0.5">{app.aiSymptomAnalysis?.severity || 'Low'}</p>
                      </div>
                    </div>

                    {/* Actions panel */}
                    {/* Actions panel */}
<div className="flex flex-wrap gap-2 pt-2">

  {/* PAYMENT PENDING */}

  {app.status === "confirmed" &&
    app.paymentStatus === "pending" && (

      <div className="w-full rounded-xl border border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 p-4">

        <div className="flex justify-between items-center">

          <div>

            <p className="font-bold text-yellow-700 dark:text-yellow-400">

              💳 Payment Pending

            </p>

            <p className="text-sm text-slate-500">

              Consultation Fee :
              <span className="font-bold text-green-600 ml-1">

                ${app.paymentAmount}

              </span>

            </p>

          </div>

          <button

            onClick={() => handlePayment(app._id)}

            className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"

          >

            Pay Now

          </button>

        </div>

      </div>

  )}

  {/* PAYMENT COMPLETED */}

{app.paymentStatus === "paid" && (

  <div className="w-full rounded-xl border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-4 space-y-3">

    <div>
      <p className="font-bold text-green-600">
        ✅ Payment Completed
      </p>

      <p className="text-xs text-slate-500 mt-1">
        Paid on {new Date(app.paidAt).toLocaleString()}
      </p>
    </div>

    {app.meetingLink ? (

      <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border">

        <p className="font-semibold text-indigo-600">
          🎥 Consultation Link Ready
        </p>

        <button
          onClick={() => window.open(app.meetingLink, "_blank")}
          className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
        >
          Join Consultation
        </button>

      </div>

    ) : (

      <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950/20 p-3 border border-yellow-300 dark:border-yellow-800">

        <p className="text-yellow-700 dark:text-yellow-400 font-semibold">
          ⏳ Waiting for doctor to share the Google Meet link...
        </p>

      </div>

    )}

  </div>

)}

  {/* AI SUMMARY */}

  {app.status === 'completed' && app.aiSummary && (
    <button
      onClick={() => setSelectedSummary(app.aiSummary)}
      className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center space-x-1.5 transition-colors"
    >
      <FileText className="w-4 h-4" />
      <span>View AI Summary</span>
    </button>
  )}

  {/* REVIEW */}

  {app.status === 'completed' && !app.review?.rating && (
    <button
      onClick={() => setReviewAppId(app._id)}
      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center space-x-1.5 transition-colors"
    >
      <Star className="w-4 h-4" />
      <span>Submit Review</span>
    </button>
  )}

  {/* CANCEL */}

  {['pending', 'confirmed'].includes(app.status) && (
    <button
      onClick={() => handleCancelAppointment(app._id)}
      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors"
    >
      Cancel Booking
    </button>
  )}

</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Support Tickets */}

<div className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-lg">

  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-6">
    My Support Tickets
  </h3>

  {tickets.length === 0 ? (

    <p className="text-sm text-slate-500">
      You haven't submitted any support tickets.
    </p>

  ) : (

    <div className="space-y-4">

      {tickets.map(ticket => (

        <div
          key={ticket._id}
          className="border rounded-2xl p-5 bg-white dark:bg-slate-950"
        >

          <div className="flex justify-between">

            <h4 className="font-bold">
              {ticket.subject}
            </h4>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                ticket.status === "Resolved"
                  ? "bg-green-100 text-green-700"
                  : ticket.status === "In Progress"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {ticket.status}
            </span>

          </div>

          <p className="mt-3 text-sm">
            <strong>Your Message:</strong>
          </p>

          <div className="mt-1 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
            {ticket.message}
          </div>

          <p className="mt-4 text-sm">
            <strong>Admin Reply:</strong>
          </p>

          <div className="mt-1 p-3 rounded-lg bg-indigo-50 dark:bg-slate-800">

            {ticket.adminReply
              ? ticket.adminReply
              : "Waiting for admin reply..."}

          </div>

        </div>

      ))}

    </div>

  )}

</div>

      {/* Profile/Medical Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <form onSubmit={handleUpdateProfile} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/30 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Edit Medical Record</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Allergies (comma-separated)</label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="E.g., Peanuts, Penicillin"
                className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Chronic Conditions (comma-separated)</label>
              <input
                type="text"
                value={conditionsText}
                onChange={(e) => setConditionsText(e.target.value)}
                placeholder="E.g., Asthma, Hypertension"
                className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Active Medications (comma-separated)</label>
              <input
                type="text"
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                placeholder="E.g., Albuterol, Metformin"
                className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Modal */}
      {reviewAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setReviewAppId(null)} />
          <form onSubmit={handlePostReview} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/30 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Submit Doctor Review</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Rating (1 to 5 Stars)</label>
              <div className="flex space-x-2 mt-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-yellow-450 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${reviewRating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Consultation Comments</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience working with this physician..."
                className="w-full mt-1.5 h-24 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none"
                required
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewAppId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-250 dark:border-slate-750 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Summary Modal */}
      {selectedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedSummary(null)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/30 overflow-hidden flex flex-col max-h-[85vh]">
            <h3 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-1.5">
              <FileText className="w-5 h-5 text-indigo-500" />
              <span>AI-Generated Consultation Report</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto py-4 space-y-4 scroll-smooth pr-1">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850">
                {formatMarkdown(selectedSummary)}
              </div>
            </div>

            <button
              onClick={() => setSelectedSummary(null)}
              className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
            >
              Close Consultation Summary
            </button>
          </div>
        </div>
      )}

      {/* AI Symptom Checker Modal wrapper */}
      <SymptomChecker isOpen={isCheckerOpen} onClose={() => setIsCheckerOpen(false)} />
    </div>
  );
};

export default PatientDashboard;
