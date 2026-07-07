import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client if API key is provided
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini AI Service initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Gemini AI Client:', error.message);
  }
} else {
  console.warn('GEMINI_API_KEY not found in environment. Using smart simulation mode for AI features.');
}

/**
 * Helper to call Gemini model with fallback
 */
const callGemini = async (prompt, systemInstruction = '') => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction 
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text.trim();
    } catch (error) {
      console.error('Gemini API call failed, falling back to local simulation:', error.message);
    }
  }
  return null;
};

/**
 * Local simulated database/rules for symptoms and specializations
 */
const symptomRules = [
  {
    keywords: ['chest', 'heart', 'palpitation', 'cardiac', 'blood pressure', 'shortness of breath'],
    specialty: 'Cardiologist',
    severity: 'High',
    details: 'The symptoms described (chest discomfort, palpitations, or potential blood pressure fluctuations) require prompt assessment. Avoid strenuous activity and seek medical evaluation. If experiencing severe chest pain spreading to your arm or jaw, seek emergency care immediately.'
  },
  {
    keywords: ['headache', 'migraine', 'dizzy', 'numbness', 'seizure', 'tingling', 'confusion'],
    specialty: 'Neurologist',
    severity: 'Medium',
    details: 'Neurological symptoms like persistent headaches, dizziness, or localized numbness can stem from various factors including migraines, nerve compression, or vascular events. Monitor frequency and schedule an evaluation.'
  },
  {
    keywords: ['skin', 'rash', 'acne', 'itching', 'mole', 'eczema', 'psoriasis', 'burn'],
    specialty: 'Dermatologist',
    severity: 'Low',
    details: 'Skin irritation, rashes, or chronic issues like acne and eczema are common dermatological conditions. Keep the affected area clean and dry, avoid scratching, and consult a dermatologist for targeted topical treatments.'
  },
  {
    keywords: ['stomach', 'belly', 'acid', 'nausea', 'vomit', 'diarrhea', 'bloating', 'constipation', 'digestion'],
    specialty: 'Gastroenterologist',
    severity: 'Medium',
    details: 'Gastrointestinal symptoms like recurring stomach aches, acid reflux, or bowel irregularity warrant assessment. Stay hydrated, eat bland foods in small portions, and avoid spicy or oily foods.'
  },
  {
    keywords: ['joint', 'bone', 'fracture', 'sprain', 'back pain', 'knee', 'muscle', 'arthritis'],
    specialty: 'Orthopedist',
    severity: 'Medium',
    details: 'Musculoskeletal discomfort such as joint pain, backaches, or potential strains can benefit from rest, ice, compression, and elevation (R.I.C.E.). Refrain from heavy lifting until evaluated.'
  },
  {
    keywords: ['child', 'pediatric', 'baby', 'kid', 'toddler', 'vaccine'],
    specialty: 'Pediatrician',
    severity: 'Low',
    details: 'Pediatric complaints require specialized care. Ensure child is resting, keeping hydrated, and monitor temperature if feverish. Consult a pediatrician for pediatric-specific dosages and care.'
  },
  {
    keywords: ['depressed', 'anxious', 'stress', 'mental', 'sad', 'sleep', 'insomnia', 'mood', 'panic'],
    specialty: 'Psychiatrist',
    severity: 'Medium',
    details: 'Mental health symptoms such as prolonged sadness, high anxiety, or sleep disruptions are highly treatable. Prioritize sleep hygiene, mild exercise, and speak with a psychiatric specialist.'
  },
  {
    keywords: ['cough', 'cold', 'fever', 'flu', 'sore throat', 'runny nose', 'ache', 'weakness'],
    specialty: 'General Physician',
    severity: 'Low',
    details: 'Mild respiratory symptoms and low-grade fevers are often viral. Rest, drink plenty of fluids (warm water, broths), and monitor your temperature. Over-the-counter anti-pyretics can provide relief.'
  }
];

/**
 * 1. AI Symptom Analysis
 */
export const analyzeSymptoms = async (symptomsText) => {
  const lowercaseSymptoms = symptomsText.toLowerCase();

  // Try Gemini first
  const geminiPrompt = `
    Analyze the following patient-reported symptoms.
    Symptoms: "${symptomsText}"
    
    You must return a JSON object with exactly the following structure (do not include markdown code block formatting, just the raw JSON text):
    {
      "severity": "Low" | "Medium" | "High",
      "suggestedSpecialization": "string representing medical specialty (e.g. Cardiologist, Dermatologist, Neurologist, General Physician)",
      "details": "A supportive clinical assessment explaining why this specialty is chosen, health advice, and urgency indicators."
    }
  `;

  const systemPrompt = "You are a professional medical assistant AI. Analyze symptoms accurately and recommend the correct specialization and severity level.";

  const aiResponse = await callGemini(geminiPrompt, systemPrompt);
  if (aiResponse) {
    try {
      // Parse JSON from text response, handle potential markdown blocks
      const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.severity && parsed.suggestedSpecialization && parsed.details) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse Gemini response as JSON. Falling back to local analyzer.', e.message);
    }
  }

  // Local Rule-Based Fallback
  for (const rule of symptomRules) {
    if (rule.keywords.some(keyword => lowercaseSymptoms.includes(keyword))) {
      return {
        severity: rule.severity,
        suggestedSpecialization: rule.specialty,
        details: rule.details
      };
    }
  }

  // Default fallback
  return {
    severity: 'Low',
    suggestedSpecialization: 'General Physician',
    details: 'Based on the generic symptoms described, we recommend consulting a General Physician for a baseline evaluation. Maintain hydration, rest, and keep track of when symptoms occur.'
  };
};

/**
 * 2. AI Healthcare Chatbot
 */
export const getChatbotResponse = async (history, userMessage) => {
  const systemPrompt = `
    You are "Aura", a warm, empathetic, and professional AI Healthcare Chatbot for a telemedicine portal.
    Your goals:
    1. Answer general health questions (clearly stating this is educational info, not a replacement for professional diagnosis).
    2. Suggest booking a doctor on the platform if symptoms warrant clinical evaluation.
    3. Keep answers concise, helpful, and formatted with bullet points for readability.
    4. NEVER prescribe specific drugs or dosages. Refer them to the doctors.
  `;

  // Construct history prompt for Gemini
  const chatContext = history.map(h => `${h.role === 'user' ? 'Patient' : 'Aura'}: ${h.content}`).join('\n');
  const geminiPrompt = `${chatContext}\nPatient: ${userMessage}\nAura:`;

  const aiResponse = await callGemini(geminiPrompt, systemPrompt);
  if (aiResponse) {
    return aiResponse;
  }

  // Local Chatbot Logic (Fallback)
  const lowercaseMsg = userMessage.toLowerCase();
  
  if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi') || lowercaseMsg.includes('hey')) {
    return "Hello! I'm Aura, your AI Healthcare Assistant. How can I help you today? You can ask me about symptoms, general health queries, or get tips on booking a consultation.";
  }
  if (lowercaseMsg.includes('book') || lowercaseMsg.includes('appointment') || lowercaseMsg.includes('doctor')) {
    return "To book an appointment:\n1. Go to the **Doctors** tab in the navigation.\n2. Filter by specialization, rating, or fee.\n3. Click on the doctor's profile to view availability.\n4. Select a preferred day and time slot, type in your symptoms, and click **Book**.\n\nLet me know if you'd like me to analyze your symptoms first!";
  }
  if (lowercaseMsg.includes('headache') || lowercaseMsg.includes('migraine')) {
    return "A headache can be triggered by stress, dehydration, lack of sleep, or eye strain. \n\n*Suggestions:*\n- Rest in a quiet, dark room.\n- Drink glass of water.\n- Apply a cool compress to your forehead.\n\nIf the headache is unusually severe, sudden, or accompanied by neck stiffness or confusion, please consult a **Neurologist** or General Physician immediately.";
  }
  if (lowercaseMsg.includes('fever') || lowercaseMsg.includes('flu') || lowercaseMsg.includes('cough')) {
    return "Fevers and coughs are typically the body's natural defense against infections.\n\n*Suggestions:*\n- Stay warm and get plenty of bed rest.\n- Keep hydrated with water, herbal teas, or warm soups.\n- Monitor your temperature.\n\nIf your fever stays above 102°F (39°C) for over 48 hours, or you have breathing difficulty, please book a session with one of our **General Physicians**.";
  }
  if (lowercaseMsg.includes('pricing') || lowercaseMsg.includes('fee') || lowercaseMsg.includes('cost')) {
    return "Consultation fees are set individually by each doctor and vary based on their experience and specialization. You can view fees directly on the **Doctors** list page before booking. There are no hidden portal fees!";
  }
  if (lowercaseMsg.includes('thank') || lowercaseMsg.includes('thanks')) {
    return "You're very welcome! Remember, I'm here 24/7 to support your wellness journey. Stay healthy!";
  }

  return "I understand your concern. While I can offer general health tips, your symptoms might benefit from a professional diagnosis. I recommend using our **Symptom Checker** on the Booking page or scheduling a quick consultation with a specialized doctor on our portal. Is there anything specific you would like to know about?";
};

/**
 * 3. AI Appointment Summary
 */
export const generateAppointmentSummary = async (symptoms, doctorNotes) => {
  const geminiPrompt = `
    Generate a detailed clinical summary based on the following consultation details:
    - Patient-Reported Symptoms: "${symptoms}"
    - Doctor's Consultation Notes: "${doctorNotes}"

    Generate the response in a professional, easy-to-read clinical format for the patient. Use Markdown formatting.
    Include sections:
    1. **Consultation Overview** (Brief recap)
    2. **Key Findings**
    3. **Prescribed Actions & Medication Plan**
    4. **AI-Powered Lifestyle & Recovery Tips** (tailored to their condition)
    5. **Follow-up recommendation**
  `;

  const systemPrompt = "You are an assistant medical writer. Create clear, concise, and professional consultation summaries for patients based on doctor notes.";

  const aiResponse = await callGemini(geminiPrompt, systemPrompt);
  if (aiResponse) {
    return aiResponse;
  }

  // Local Simulated Summary Generation (Fallback)
  return `### Clinical Consultation Summary

**1. Consultation Overview**
This is a summary of your consultation regarding your reported symptoms: *"${symptoms}"*.

**2. Key Findings**
Based on the discussion, the primary concerns addressed:
- Diagnosis/Assessment: ${doctorNotes || 'Routine check-up and symptom monitoring.'}

**3. Prescribed Actions & Medication Plan**
- Follow any specific guidelines provided by your doctor.
- Take prescribed medications on time and as directed.
- Contact the clinic if any adverse side effects occur.

**4. AI-Powered Lifestyle & Recovery Tips**
- **Hydration:** Aim for 8-10 glasses of water daily to support cellular recovery.
- **Nutrition:** Focus on whole foods, vitamins, and antioxidants. Avoid heavily processed meals.
- **Activity:** Prioritize sleep (7-8 hours) and avoid high-intensity exercise until fully recovered.
- **Monitoring:** Track your temperature, pain levels, or other reactions daily.

**5. Follow-up recommendation**
If symptoms persist or worsen within 5-7 days, please book a follow-up consultation with your specialist.`;
};
