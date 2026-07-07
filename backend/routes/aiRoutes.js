import express from 'express';
import { runSymptomCheck, runChatbot } from '../controllers/aiController.js';

const router = express.Router();

router.post('/symptom-check', runSymptomCheck);
router.post('/chatbot', runChatbot);

export default router;
