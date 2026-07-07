import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';
import { Calendar, Clock, Check, X, FileText, Activity, Users, DollarSign, Star, ClipboardList, Info, MessageSquare } from 'lucide-react';
import ChatSessionModal from '../components/ChatSessionModal';
import socket from "../services/socket";

const DoctorDashboard = () => {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [meetingLinks, setMeetingLinks] = useState({});
  const [loading, setLoading] = useState(true);

  // Completion modal states
  const [completeAppId, setCompleteAppId] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [completing, setCompleting] = useState(false);

  // Selected Patient Details
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeChatApp, setActiveChatApp] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Doctor Connected:", socket.id);
    });

    return () => {
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentAPI.getDoctorAppointments();
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Failed to fetch doctor appointments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await appointmentAPI.updateStatus(id, status);
      if (res.data.success) {
        fetchAppointments();
      }
    } catch (err) {
      console.error(`Failed to update status to ${status}:`, err.message);
    }
  };

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!doctorNotes.trim()) return;

    setCompleting(true);
    try {
      const res = await appointmentAPI.complete(completeAppId, doctorNotes);
      if (res.data.success) {
        setCompleteAppId(null);
        setDoctorNotes('');
        fetchAppointments();
      }
    } catch (err) {
      console.error('Failed to complete consultation:', err.message);
    } finally {
      setCompleting(false);
    }
  };

  const handleShareMeetingLink = async (appointmentId) => {
    try {
      const meetingLink = meetingLinks[appointmentId];

      if (!meetingLink) {
        alert("Please enter a Google Meet link.");
        return;
      }

      const res = await appointmentAPI.shareMeetingLink(
        appointmentId,
        meetingLink
      );

      if (res.data.success) {
        alert("Meeting link shared successfully.");
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to share meeting link.");
    }
  };

  // Analytics helper calculations
  const completedAppointments = appointments.filter(
  a => a.status === "completed"
);

const pendingCount = appointments.filter(
  a => a.status === "pending"
).length;

const paidAppointments = appointments.filter(
  a => a.paymentStatus === "paid"
);

const pendingPayments = appointments.filter(
  a => a.paymentStatus === "pending"
);

const totalEarnings = paidAppointments.reduce(
  (total, app) => total + (app.paymentAmount || 0),
  0
);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/30">Confirmed</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/30">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-650 dark:text-rose-455 rounded-full border border-rose-100 dark:border-rose-900/30">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700/50">Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Greeting Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome, Dr. {user?.name || 'Physician'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage clinical requests, check patient files, and record notes.</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <ClipboardList className="w-4 h-4" />
          <span>{profile?.specialization || 'General Practice'}</span>
        </div>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Consultations</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{completedAppointments.length}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Consultation Earnings</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${totalEarnings}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Pending Requests</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-650 dark:text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md">
  <div className="flex items-center justify-between">

    <div>

      <p className="text-[10px] uppercase font-bold text-slate-400">

        Pending Payments

      </p>

      <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">

        {pendingPayments.length}

      </h3>

    </div>

    <div className="p-3 rounded-2xl bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600">

      <DollarSign className="w-5 h-5"/>

    </div>

  </div>
</div>

        <div className="p-5 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Portal Rating</p>
              <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {profile?.averageRating || 5.0} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-yellow-50 dark:bg-yellow-950/40 text-yellow-550 dark:text-yellow-400">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>
      </div>

      {/* Appointment requests list */}
      <div className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-lg">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
          <ClipboardList className="w-5 h-5 text-indigo-500" />
          <span>Patient Consultation Schedule</span>
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="w-8 h-8 border-3 border-indigo-600 rounded-full animate-spin border-t-transparent"></span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No scheduled consultations</p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">When patients book your slots, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => (
              <div
                key={app._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm flex flex-col space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-900">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                      {app.patient ? app.patient.name.charAt(0) : 'P'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {app.patient ? app.patient.name : 'Deleted Patient'}
                      </p>
                      <p className="text-xs text-slate-400">{app.patient?.email} • {app.patient?.phone}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">

    {getStatusBadge(app.status)}

    {app.paymentStatus === "pending" && (
        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
            Payment Pending
        </span>
    )}

    {app.paymentStatus === "paid" && (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
            Paid
        </span>
    )}

</div>
                </div>

                {/* Symptoms description */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-350">Symptoms Description:</p>
                  <p className="text-slate-600 dark:text-slate-350 mt-1 italic">"{app.symptomsDescription}"</p>
                  <div className="mt-2.5 pt-2 border-t border-slate-150 dark:border-slate-800 flex items-center space-x-4">
                    <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 rounded">
                      AI Suggested specialty: {app.aiSymptomAnalysis?.suggestedSpecialization || 'General'}
                    </span>
                    <span className="text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-400 px-2 py-0.5 rounded">
                      Severity: {app.aiSymptomAnalysis?.severity || 'Low'}
                    </span>
                  </div>
                </div>

                {app.paymentStatus && (
  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
    <div className="flex justify-between">
      <span className="font-semibold">Payment Status</span>
      <span>{app.paymentStatus}</span>
    </div>

    <div className="flex justify-between mt-2">
      <span>Amount</span>
      <span className="font-bold text-green-600">
        ${app.paymentAmount}
      </span>
    </div>
  </div>
)}

                <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>{new Date(app.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>{app.timeSlot}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    {app.patientProfile && (
                      <button
                        onClick={() => setSelectedPatient({ ...app.patientProfile, name: app.patient?.name })}
                        className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold transition-all"
                      >
                        Patient Record
                      </button>
                    )}

                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'confirmed')}
                          className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1 transition-all"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'cancelled')}
                          className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold flex items-center space-x-1 transition-all"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {app.status === 'confirmed' &&  app.paymentStatus === 'paid' && (
                      <div className="w-full space-y-3">
                        <input
                          type="text"
                          placeholder="Paste Google Meet link..."
                          value={meetingLinks[app._id] || app.meetingLink || ""}
                          onChange={(e) =>
                            setMeetingLinks({
                              ...meetingLinks,
                              [app._id]: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleShareMeetingLink(app._id)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                          >
                            Send Meeting Link
                          </button>
                          <button
                            onClick={() => setCompleteAppId(app._id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                          >
                            Complete Session
                          </button>
                        </div>
                      </div>
                    )}

                    {app.status === 'confirmed' && app.consultationType === 'chat' && (
                      <button
                        onClick={() => setActiveChatApp(app)}
                        className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat Session</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Consultation Notes Modal */}
      {completeAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCompleteAppId(null)} />
          <form onSubmit={handleCompleteConsultation} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/30 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Record Consultation Summary</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Clinical Diagnosis & Notes</label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Type details of your prescription, follow-up timelines, and critical warnings. Aura AI will draft a complete clinical summary for the patient."
                className="w-full h-32 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCompleteAppId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={completing}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                {completing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Record Notes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Patient Record View Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedPatient(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/30 space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Patient Clinical History</h3>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Close</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <p className="text-slate-450 uppercase font-bold text-[9px]">Name</p>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{selectedPatient.name || 'Anonymous'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-450 uppercase font-bold text-[9px]">Gender</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{selectedPatient.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-slate-450 uppercase font-bold text-[9px]">Blood Group</p>
                  <p className="font-semibold text-indigo-500 mt-0.5">{selectedPatient.bloodGroup || 'Unknown'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-350">Allergies:</h4>
                {selectedPatient.medicalHistory?.allergies?.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selectedPatient.medicalHistory.allergies.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded text-[10px] font-semibold">{item}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 mt-1 italic">No allergies declared.</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-350">Chronic Conditions:</h4>
                {selectedPatient.medicalHistory?.chronicConditions?.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selectedPatient.medicalHistory.chronicConditions.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded text-[10px] font-semibold">{item}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 mt-1 italic">No chronic conditions declared.</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-350">Active Medications:</h4>
                {selectedPatient.medicalHistory?.currentMedications?.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selectedPatient.medicalHistory.currentMedications.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 rounded text-[10px] font-semibold">{item}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 mt-1 italic">No active medications declared.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Chat Session Modal wrapper */}
      {activeChatApp && (
        <ChatSessionModal
          appointment={activeChatApp}
          currentUser={user}
          onClose={() => setActiveChatApp(null)}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
