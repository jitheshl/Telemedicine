import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_DOCTORS } from './Doctors';

const Booking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  // Find the selected doctor from mock data
  const doctor = MOCK_DOCTORS.find((d) => d.id === doctorId);

  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [symptoms, setSymptoms] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!doctor) return;
    
    setLoading(true);

    const newAppointment = {
      id: `apt-${Date.now()}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      date: bookingDate,
      time: bookingTime,
      symptoms: symptoms,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    // Store in localStorage
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    existingAppointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(existingAppointments));

    setTimeout(() => {
      setLoading(false);
      setSuccess('Appointment booked successfully! Redirecting to Patient Dashboard...');
      setTimeout(() => {
        navigate('/patient-dashboard');
      }, 1500);
    }, 1000);
  };

  if (!doctor) {
    return (
      <div className="container animated-fade-in" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Doctor Not Found</h2>
        <p>The requested doctor profile could not be loaded.</p>
        <button onClick={() => navigate('/doctors')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Doctors Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="container animated-fade-in" style={{ padding: '3rem 1.5rem', maxWidth: '680px', flexGrow: 1 }}>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Schedule Appointment</h2>
        
        {/* Doctor Info card */}
        <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid rgba(95, 93, 236, 0.2)' }}>
          <div style={{ fontSize: '2.5rem' }}>👨‍⚕️</div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{doctor.name}</h4>
            <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', fontWeight: 650, color: 'var(--primary)' }}>{doctor.specialization}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fee: ${doctor.fee} • Experience: {doctor.experience}</p>
          </div>
        </div>

        {success && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success-light)', color: 'var(--success)', fontSize: '0.9rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleBookingSubmit}>
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="appointment-date">Select Date</label>
              <input
                id="appointment-date"
                type="date"
                className="form-control"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Prevents selecting past dates
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="appointment-time">Select Time Slot</label>
              <select
                id="appointment-time"
                className="form-control"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="04:30 PM">04:30 PM</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="booking-symptoms">Briefly Describe Your Symptoms</label>
            <textarea
              id="booking-symptoms"
              className="form-control"
              rows="4"
              placeholder="e.g. Cough, sore throat, or headache for past 3 days..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Processing booking...' : 'Confirm Consultation Booking'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/doctors')} 
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;
