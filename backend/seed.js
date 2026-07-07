import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import PatientProfile from './models/PatientProfile.js';
import DoctorProfile from './models/DoctorProfile.js';

// Load env variables
dotenv.config();

const usersData = [
  // Patients
  {
    name: 'Aarti Agarwal',
    email: 'aarti.agarwal@gmail.com',
    password: '987654321',
    role: 'patient',
    gender: 'Female',
    bloodGroup: 'O+',
  },
  {
    name: 'Bhavna Sharma',
    email: 'bhavna.sharma@gmail.com',
    password: '987654321',
    role: 'patient',
    gender: 'Female',
    bloodGroup: 'A+',
  },
  {
    name: 'Jaladi Jagadeep',
    email: 'jaladijagadeep2007@gmail.com',
    password: '987654321',
    role: 'patient',
    gender: 'Male',
    bloodGroup: 'B+',
  },
  {
    name: 'Krishna',
    email: 'krishna@gmail.com',
    password: '123456',
    role: 'patient',
    gender: 'Male',
    bloodGroup: 'AB+',
  },
  {
    name: 'Neha Kapoor',
    email: 'neha.kapoor@gmail.com',
    password: '987654321',
    role: 'patient',
    gender: 'Female',
    bloodGroup: 'O-',
  },
  {
    name: 'Patient 1',
    email: 'patient1@gmail.com',
    password: 'Patient1',
    role: 'patient',
    gender: 'Prefer not to say',
    bloodGroup: 'Unknown',
  },
  {
    name: 'Shivangi Patel',
    email: 'shivangi.patel@gmail.com',
    password: '987654321',
    role: 'patient',
    gender: 'Female',
    bloodGroup: 'B-',
  },
  // Doctors
  {
    name: 'Ananya Iyer',
    email: 'ananya.iyer@gmail.com',
    password: 'Doctor@123',
    role: 'doctor',
    specialization: 'Cardiologist',
    experience: 12,
    consultationFee: 500,
    qualifications: ['MD - Cardiology', 'MBBS'],
    hospital: 'Apollo Hospitals',
    availability: [
      { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
      { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
      { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] }
    ]
  },
  {
    name: 'Arjun Mehta',
    email: 'arjun.mehta@gmail.com',
    password: 'Doctor@123',
    role: 'doctor',
    specialization: 'Neurologist',
    experience: 15,
    consultationFee: 600,
    qualifications: ['DM - Neurology', 'MD', 'MBBS'],
    hospital: 'Fortis Hospital',
    availability: [
      { day: 'Tuesday', slots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Thursday', slots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Saturday', slots: ['09:00 AM', '11:00 AM', '01:00 PM'] }
    ]
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    password: 'Doctor@123',
    role: 'doctor',
    specialization: 'Dermatologist',
    experience: 8,
    consultationFee: 400,
    qualifications: ['MD - Dermatology', 'MBBS'],
    hospital: 'Max Healthcare',
    availability: [
      { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
      { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
      { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] }
    ]
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@gmail.com',
    password: 'Doctor@123',
    role: 'doctor',
    specialization: 'Gastroenterologist',
    experience: 10,
    consultationFee: 450,
    qualifications: ['DM - Gastroenterology', 'MD', 'MBBS'],
    hospital: 'Medanta',
    availability: [
      { day: 'Tuesday', slots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Thursday', slots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Saturday', slots: ['09:00 AM', '11:00 AM', '01:00 PM'] }
    ]
  },
  {
    name: 'Satya Sai',
    email: 'satya.sai@gmail.com',
    password: 'Doctor@123',
    role: 'doctor',
    specialization: 'Cardiologist',
    experience: 14,
    consultationFee: 550,
    qualifications: ['MD - Cardiology', 'MBBS'],
    hospital: 'Apollo Hospitals',
    availability: [
      { day: 'Monday', slots: ['09:00 AM', '11:00 AM', '03:00 PM'] },
      { day: 'Thursday', slots: ['09:00 AM', '11:00 AM', '03:00 PM'] }
    ]
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@gmail.com',
    password: 'Doctor@123',
    role: 'doctor',
    specialization: 'Dermatologist',
    experience: 9,
    consultationFee: 420,
    qualifications: ['MD - Dermatology', 'MBBS'],
    hospital: 'KIMS Hospital',
    availability: [
      { day: 'Wednesday', slots: ['10:00 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Saturday', slots: ['09:00 AM', '11:00 AM', '01:00 PM'] }
    ]
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@gmail.com',
    password: 'Doctor@123',
    role: 'doctor',
    specialization: 'General Physician',
    experience: 18,
    consultationFee: 300,
    qualifications: ['MD - General Medicine', 'MBBS'],
    hospital: 'AIIMS',
    availability: [
      { day: 'Monday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Tuesday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Wednesday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Thursday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
      { day: 'Friday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] }
    ]
  }
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log('Cleaning existing users/profiles matching target emails...');
    const emails = usersData.map(u => u.email);
    
    // Find matching users first to delete their profiles
    const existingUsers = await User.find({ email: { $in: emails } });
    const userIds = existingUsers.map(u => u._id);

    await PatientProfile.deleteMany({ user: { $in: userIds } });
    await DoctorProfile.deleteMany({ user: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });

    console.log('Seeding new users and profiles...');

    for (const data of usersData) {
      const { name, email, password, role, ...profileDetails } = data;

      // Create user
      const user = new User({
        name,
        email,
        password,
        role,
      });

      await user.save();
      console.log(`Created User: ${user.name} (${user.role})`);

      // Create profile based on role
      if (role === 'patient') {
        await PatientProfile.create({
          user: user._id,
          gender: profileDetails.gender || 'Prefer not to say',
          bloodGroup: profileDetails.bloodGroup || 'Unknown',
          medicalHistory: {
            allergies: [],
            chronicConditions: [],
            currentMedications: [],
          }
        });
        console.log(`Created Patient Profile for ${user.name}`);
      } else if (role === 'doctor') {
        await DoctorProfile.create({
          user: user._id,
          specialization: profileDetails.specialization,
          experience: profileDetails.experience,
          consultationFee: profileDetails.consultationFee,
          qualifications: profileDetails.qualifications,
          hospital: profileDetails.hospital,
          availability: profileDetails.availability,
          isVerified: true, // Auto verify so they are visible in system
        });
        console.log(`Created Doctor Profile for ${user.name}`);
      }
    }

    console.log('Database seeded successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();
