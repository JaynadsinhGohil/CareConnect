import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { doctorController, patientController, appointmentController, medicalRecordController, prescriptionController } from '../controllers/index.js';
const router = express.Router();
router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'receptionist']));
// Admin routes for managing users
router.post('/staff', roleMiddleware(['admin']), doctorController.createStaff);
router.get('/doctors', doctorController.getAll);
router.get('/patients', patientController.getAll);
router.get('/appointments', appointmentController.getAll);
router.post('/appointments', appointmentController.createAppointment);
router.patch('/appointments/:appointmentId/status', appointmentController.updateAppointmentStatus);
router.get('/medical-records', medicalRecordController.getAll);
router.post('/medical-records', medicalRecordController.create);
router.get('/prescriptions', prescriptionController.getAll);
router.post('/prescriptions', prescriptionController.create);
export default router;
//# sourceMappingURL=admin.js.map