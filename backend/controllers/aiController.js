import { analyzeSymptoms, getChatbotResponse } from '../services/aiService.js';
import DoctorProfile from '../models/DoctorProfile.js';

// @desc    Analyze symptoms and recommend matching doctors
// @route   POST /api/ai/symptom-check
// @access  Public
export const runSymptomCheck = async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || symptoms.trim() === '') {
    return res.status(400).json({ success: false, message: 'Please enter symptoms to analyze' });
  }

  try {
    const analysis = await analyzeSymptoms(symptoms);

    // Fetch doctors matching the suggested specialization
    const matchingDoctors = await DoctorProfile.find({
      specialization: { $regex: analysis.suggestedSpecialization, $options: 'i' },
      isVerified: true, // Show verified doctors first
    }).populate('user', 'name profileImage location bio consultationFee');

    // Fallback: if no doctors match, get general physicians or top rated doctors
    let recommendedDoctors = matchingDoctors;
    if (matchingDoctors.length === 0) {
      recommendedDoctors = await DoctorProfile.find()
        .populate('user', 'name profileImage location bio consultationFee')
        .sort({ averageRating: -1 })
        .limit(3);
    }

    res.json({
      success: true,
      analysis,
      recommendedDoctors,
    });
  } catch (error) {
    console.error('Symptom Check Controller Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Interact with AI chatbot (Aura)
// @route   POST /api/ai/chatbot
// @access  Public
export const runChatbot = async (req, res) => {
  const { history = [], message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ success: false, message: 'Please enter a message' });
  }

  try {
    const reply = await getChatbotResponse(history, message);

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error('Chatbot Controller Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
