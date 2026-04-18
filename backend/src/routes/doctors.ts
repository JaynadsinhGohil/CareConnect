import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { doctorController, medicalRecordController, prescriptionController } from '../controllers/index.js';

const router = express.Router();

router.use(authMiddleware);

// Patients need this endpoint to select a doctor during appointment booking.
router.get('/', roleMiddleware(['doctor', 'admin', 'patient']), doctorController.getAll);

router.use(roleMiddleware(['doctor', 'admin']));

// Doctor routes
router.get('/profile', doctorController.getProfile);
router.get('/appointments', doctorController.getAppointments);
router.get('/patients', doctorController.getPatients);
router.patch('/patients/:patientId/treatment-status', doctorController.updatePatientTreatmentStatus);
router.patch('/appointments/:appointmentId/status', doctorController.updateAppointmentStatus);

// Medical records
router.get('/medical-records', medicalRecordController.getAll);
router.post('/medical-records', medicalRecordController.create);
router.patch('/medical-records/:recordId', medicalRecordController.update);

// Prescriptions
router.get('/prescriptions', prescriptionController.getAll);
router.post('/prescriptions', prescriptionController.create);
router.patch('/prescriptions/:prescriptionId', prescriptionController.update);

export default router;
