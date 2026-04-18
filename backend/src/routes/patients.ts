import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { patientController, appointmentController } from '../controllers/index.js';

const router = express.Router();

// Public register endpoint (no auth required)
router.post('/register', patientController.registerPatient);

// Protected routes
router.use(authMiddleware);
router.use(roleMiddleware(['patient', 'admin']));

// Patient routes
router.get('/', patientController.getAll);
router.get('/profile', patientController.getProfile);
router.patch('/profile', patientController.updateProfile);
router.get('/appointments', patientController.getAppointments);
router.post('/appointments', patientController.bookAppointment);
router.get('/medical-records', patientController.getMedicalRecords);
router.get('/prescriptions', patientController.getPrescriptions);

export default router;
