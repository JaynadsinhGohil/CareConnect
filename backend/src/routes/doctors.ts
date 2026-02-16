import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { doctorController, medicalRecordController, prescriptionController } from '../controllers/index.js';

const router = express.Router();

router.use(authMiddleware);

// Doctor routes
router.get('/', doctorController.getAll);
router.get('/profile', doctorController.getProfile);
router.get('/appointments', doctorController.getAppointments);
router.patch('/appointments/:appointmentId/status', doctorController.updateAppointmentStatus);

// Medical records
router.get('/medical-records', medicalRecordController.getAll);
router.post('/medical-records', medicalRecordController.create);

// Prescriptions
router.get('/prescriptions', prescriptionController.getAll);
router.post('/prescriptions', prescriptionController.create);

export default router;
