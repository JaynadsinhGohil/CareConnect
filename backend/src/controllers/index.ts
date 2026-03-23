import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { doctorModel, appointmentModel, patientModel, medicalRecordModel, prescriptionModel, auditLogModel } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { broadcastRealtimeEvent } from '../realtime/ws.js';

export const doctorController = {
  createStaff: async (req: AuthRequest, res: Response) => {
    try {
      const { firstName, lastName, email, phone, role, password, specialization } = req.body;

      if (!firstName || !lastName || !email || !phone || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate default password in format: firstname@123
      const staffPassword = password || `${firstName.toLowerCase()}@123`;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(staffPassword, 10);
      const userId = uuidv4();
      const doctorId = uuidv4();

      // Create user account
      await pool.query(
        'INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, email, hashedPassword, firstName, lastName, role, phone, 'active']
      );

      // If role is doctor, create doctor profile
      if (role === 'doctor') {
        await pool.query(
          'INSERT INTO doctors (id, user_id, specialization) VALUES ($1, $2, $3)',
          [doctorId, userId, specialization || 'General Medicine']
        );
      }

      // Return created staff with credentials (only one-time display)
      res.status(201).json({
        id: userId,
        email,
        firstName,
        lastName,
        phone,
        role,
        specialization: specialization || 'General Medicine',
        password: staffPassword, // Only sent once on creation
        createdAt: new Date(),
      });
    } catch (error: any) {
      console.error('Create staff error:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: `Failed to create staff: ${error.message}` });
    }
  },

  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const page = Number(req.query.page || 0);
      const pageSize = Number(req.query.pageSize || 0);
      const query = typeof req.query.query === 'string' ? req.query.query : '';

      if (page > 0 || pageSize > 0 || query.trim().length > 0) {
        const result = await doctorModel.getAllPaginated({
          page,
          pageSize,
          query,
        });
        return res.json(result);
      }

      const doctors = await doctorModel.getAll();
      res.json(doctors);
    } catch (error) {
      console.error('Get doctors error:', error);
      res.status(500).json({ error: 'Failed to get doctors' });
    }
  },

  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const doctor = await doctorModel.findByUserId(req.userId!);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor profile not found' });
      }
      res.json(doctor);
    } catch (error) {
      console.error('Get doctor profile error:', error);
      res.status(500).json({ error: 'Failed to get doctor profile' });
    }
  },

  getAppointments: async (req: AuthRequest, res: Response) => {
    try {
      const doctor = await doctorModel.findByUserId(req.userId!);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      const appointments = await appointmentModel.getByDoctor(doctor.id);
      res.json(appointments);
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ error: 'Failed to get appointments' });
    }
  },

  getPatients: async (req: AuthRequest, res: Response) => {
    try {
      const doctor = await doctorModel.findByUserId(req.userId!);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      const patients = await doctorModel.getPatientsByDoctor(doctor.id);
      res.json(patients);
    } catch (error) {
      console.error('Get doctor patients error:', error);
      res.status(500).json({ error: 'Failed to get patients' });
    }
  },

  updateAppointmentStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const { status } = req.body;

      if (!['completed', 'cancelled', 'no-show'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const appointment = await appointmentModel.updateStatus(appointmentId, status);

      await auditLogModel.create(
        req.userId || null,
        req.role || null,
        'appointment-status-updated',
        'appointment',
        appointmentId,
        { status }
      );

      broadcastRealtimeEvent('appointment-updated', {
        appointmentId,
        status,
      });

      res.json(appointment);
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  },
};

export const patientController = {
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const page = Number(req.query.page || 0);
      const pageSize = Number(req.query.pageSize || 0);
      const query = typeof req.query.query === 'string' ? req.query.query : '';

      if (page > 0 || pageSize > 0 || query.trim().length > 0) {
        const result = await patientModel.getAllPaginated({
          page,
          pageSize,
          query,
        });
        return res.json(result);
      }

      const patients = await patientModel.getAll();
      res.json(patients);
    } catch (error) {
      console.error('Get patients error:', error);
      res.status(500).json({ error: 'Failed to get patients' });
    }
  },

  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const patient = await patientModel.findByUserId(req.userId!);
      if (!patient) {
        return res.status(404).json({ error: 'Patient profile not found' });
      }
      res.json(patient);
    } catch (error) {
      console.error('Get patient profile error:', error);
      res.status(500).json({ error: 'Failed to get patient profile' });
    }
  },

  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      const patient = await patientModel.findByUserId(req.userId!);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const updatedPatient = await patientModel.update(patient.id, req.body);
      res.json(updatedPatient);
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({ error: 'Failed to update patient' });
    }
  },

  registerPatient: async (req: AuthRequest, res: Response) => {
    try {
      const { firstName, lastName, email, phone, dateOfBirth, gender, password } = req.body;

      if (!firstName || !lastName || !email || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate password in format: firstname@ddmmyy (e.g., jaynad@150606)
      let patientPassword = password;
      if (!patientPassword) {
        if (dateOfBirth) {
          const [year, month, day] = dateOfBirth.split('-');
          patientPassword = `${firstName.toLowerCase()}@${day}${month}${year.slice(-2)}`;
        } else {
          patientPassword = `${firstName.toLowerCase()}@123`;
        }
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(patientPassword, 10);
      const userId = uuidv4();
      const patientId = uuidv4();

      // Create user (note: column name is password_hash)
      await pool.query(
        'INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, email, hashedPassword, firstName, lastName, 'patient', phone, 'active']
      );

      // Create patient profile
      await pool.query(
        'INSERT INTO patients (id, user_id, date_of_birth, gender) VALUES ($1, $2, $3, $4)',
        [patientId, userId, dateOfBirth || null, gender || null]
      );

      // Return credentials (only one-time display)
      res.status(201).json({
        id: userId,
        email,
        role: 'patient',
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gender,
        password: patientPassword, // Only sent once on creation
        createdAt: new Date(),
      });
    } catch (error: any) {
      console.error('Register patient error:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: `Failed to register patient: ${error.message}` });
    }
  },

  getAppointments: async (req: AuthRequest, res: Response) => {
    try {
      const patient = await patientModel.findByUserId(req.userId!);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const appointments = await appointmentModel.getByPatient(patient.id);
      res.json(appointments);
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ error: 'Failed to get appointments' });
    }
  },

  bookAppointment: async (req: AuthRequest, res: Response) => {
    try {
      const { doctorId, appointmentDate, reason } = req.body;

      if (!doctorId || !appointmentDate || !reason) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const patient = await patientModel.findByUserId(req.userId!);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Check for conflicts
      const hasConflict = await appointmentModel.checkConflict(doctorId, new Date(appointmentDate));
      if (hasConflict) {
        return res.status(409).json({ error: 'Doctor has another appointment at this time. Please choose a different time.' });
      }

      const appointment = await appointmentModel.create(
        patient.id,
        doctorId,
        new Date(appointmentDate),
        reason
      );

      await auditLogModel.create(
        req.userId || null,
        req.role || null,
        'appointment-created',
        'appointment',
        appointment.id,
        {
          doctorId,
          patientId: patient.id,
          appointmentDate,
        }
      );

      broadcastRealtimeEvent('appointment-created', {
        appointmentId: appointment.id,
        doctorId,
        patientId: patient.id,
      });

      res.status(201).json(appointment);
    } catch (error) {
      console.error('Book appointment error:', error);
      res.status(500).json({ error: 'Failed to book appointment' });
    }
  },

  getMedicalRecords: async (req: AuthRequest, res: Response) => {
    try {
      const patient = await patientModel.findByUserId(req.userId!);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const records = await medicalRecordModel.getByPatient(patient.id);
      res.json(records);
    } catch (error) {
      console.error('Get medical records error:', error);
      res.status(500).json({ error: 'Failed to get medical records' });
    }
  },

  getPrescriptions: async (req: AuthRequest, res: Response) => {
    try {
      const patient = await patientModel.findByUserId(req.userId!);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const prescriptions = await prescriptionModel.getByPatient(patient.id);
      res.json(prescriptions);
    } catch (error) {
      console.error('Get prescriptions error:', error);
      res.status(500).json({ error: 'Failed to get prescriptions' });
    }
  },
};

export const medicalRecordController = {
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const records = await medicalRecordModel.getAll();
      res.json(records);
    } catch (error) {
      console.error('Get medical records error:', error);
      res.status(500).json({ error: 'Failed to get medical records' });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const { patientId, appointmentId, diagnosis, treatment_plan, medications, attachments } = req.body;

      if (!patientId || !diagnosis || !treatment_plan) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const doctor = await doctorModel.findByUserId(req.userId!);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      const record = await medicalRecordModel.create(
        patientId,
        doctor.id,
        appointmentId,
        diagnosis,
        treatment_plan,
        medications || '',
        Array.isArray(attachments) ? attachments : []
      );

      res.status(201).json(record);
    } catch (error) {
      console.error('Create medical record error:', error);
      res.status(500).json({ error: 'Failed to create medical record' });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const { recordId } = req.params;
      const { diagnosis, treatment_plan, medications, attachments } = req.body;

      if (!diagnosis || !treatment_plan) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const doctor = await doctorModel.findByUserId(req.userId!);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      const updated = await medicalRecordModel.updateByDoctor(
        recordId,
        doctor.id,
        diagnosis,
        treatment_plan,
        medications || '',
        Array.isArray(attachments) ? attachments : []
      );

      if (!updated) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Update medical record error:', error);
      res.status(500).json({ error: 'Failed to update medical record' });
    }
  },
};

export const prescriptionController = {
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const prescriptions = await prescriptionModel.getAll();
      res.json(prescriptions);
    } catch (error) {
      console.error('Get prescriptions error:', error);
      res.status(500).json({ error: 'Failed to get prescriptions' });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const { patientId, medicationName, dosage, frequency, duration, instructions } = req.body;

      if (!patientId || !medicationName || !dosage || !frequency) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const doctor = await doctorModel.findByUserId(req.userId!);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      const prescription = await prescriptionModel.create(
        patientId,
        doctor.id,
        medicationName,
        dosage,
        frequency,
        duration || '30 days',
        instructions || ''
      );

      res.status(201).json(prescription);
    } catch (error) {
      console.error('Create prescription error:', error);
      res.status(500).json({ error: 'Failed to create prescription' });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const { prescriptionId } = req.params;
      const { medicationName, dosage, frequency, duration, instructions } = req.body;

      if (!medicationName || !dosage || !frequency) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const doctor = await doctorModel.findByUserId(req.userId!);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      const updated = await prescriptionModel.updateByDoctor(
        prescriptionId,
        doctor.id,
        medicationName,
        dosage,
        frequency,
        duration || '30 days',
        instructions || ''
      );

      if (!updated) {
        return res.status(404).json({ error: 'Prescription not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Update prescription error:', error);
      res.status(500).json({ error: 'Failed to update prescription' });
    }
  },
};

export const adminController = {
  getStaff: async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        `
          SELECT
            u.id,
            u.first_name AS "firstName",
            u.last_name AS "lastName",
            u.email,
            u.phone,
            u.role,
            u.status,
            u.created_at AS "createdAt",
            d.specialization
          FROM users u
          LEFT JOIN doctors d ON d.user_id = u.id
          WHERE u.role IN ('admin', 'doctor', 'receptionist')
          ORDER BY u.created_at DESC
        `
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get staff error:', error);
      res.status(500).json({ error: 'Failed to get staff list' });
    }
  },

  updateStaffStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { staffId } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const targetUser = await pool.query(
        `SELECT id, role FROM users WHERE id = $1 AND role IN ('admin', 'doctor', 'receptionist')`,
        [staffId]
      );

      if (targetUser.rowCount === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      const userRole = targetUser.rows[0].role as string;

      if (userRole === 'admin' && status !== 'active') {
        const activeAdminCount = await pool.query(
          `SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin' AND status = 'active'`
        );

        if (activeAdminCount.rows[0].count <= 1) {
          return res.status(400).json({ error: 'At least one active admin must remain in the system' });
        }
      }

      const updatedResult = await pool.query(
        `
          UPDATE users
          SET status = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING
            id,
            first_name AS "firstName",
            last_name AS "lastName",
            email,
            phone,
            role,
            status,
            created_at AS "createdAt"
        `,
        [status, staffId]
      );

      res.json(updatedResult.rows[0]);
    } catch (error) {
      console.error('Update staff status error:', error);
      res.status(500).json({ error: 'Failed to update staff status' });
    }
  },

  deleteStaff: async (req: AuthRequest, res: Response) => {
    try {
      const { staffId } = req.params;

      if (staffId === req.userId) {
        return res.status(400).json({ error: 'You cannot remove your own account' });
      }

      const targetUser = await pool.query(
        `SELECT id, role FROM users WHERE id = $1 AND role IN ('admin', 'doctor', 'receptionist')`,
        [staffId]
      );

      if (targetUser.rowCount === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      const userRole = targetUser.rows[0].role as string;

      if (userRole === 'admin') {
        const adminCount = await pool.query(
          `SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'`
        );

        if (adminCount.rows[0].count <= 1) {
          return res.status(400).json({ error: 'Cannot remove the last admin account' });
        }
      }

      await pool.query(
        `DELETE FROM users WHERE id = $1 AND role IN ('admin', 'doctor', 'receptionist')`,
        [staffId]
      );

      res.json({ message: 'Staff member removed successfully' });
    } catch (error) {
      console.error('Delete staff error:', error);
      res.status(500).json({ error: 'Failed to remove staff member' });
    }
  },
};

export const appointmentController = {
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const page = Number(req.query.page || 0);
      const pageSize = Number(req.query.pageSize || 0);
      const query = typeof req.query.query === 'string' ? req.query.query : '';
      const date = typeof req.query.date === 'string' ? req.query.date : '';
      const doctorId = typeof req.query.doctorId === 'string' ? req.query.doctorId : '';

      if (page > 0 || pageSize > 0 || query.trim().length > 0 || date || doctorId) {
        const result = await appointmentModel.getAllPaginated({
          page,
          pageSize,
          query,
          date,
          doctorId,
        });
        return res.json(result);
      }

      const appointments = await appointmentModel.getAll();
      res.json(appointments);
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ error: 'Failed to get appointments' });
    }
  },

  getById: async (req: AuthRequest, res: Response) => {
    try {
      const appointment = await appointmentModel.findById(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json(appointment);
    } catch (error) {
      console.error('Get appointment error:', error);
      res.status(500).json({ error: 'Failed to get appointment' });
    }
  },

  checkConflict: async (req: AuthRequest, res: Response) => {
    try {
      const { doctorId, appointmentDate } = req.body;

      if (!doctorId || !appointmentDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const hasConflict = await appointmentModel.checkConflict(doctorId, new Date(appointmentDate));
      res.json({ hasConflict });
    } catch (error) {
      console.error('Check conflict error:', error);
      res.status(500).json({ error: 'Failed to check appointment conflict' });
    }
  },

  createAppointment: async (req: AuthRequest, res: Response) => {
    try {
      const { patientId, doctorId, appointmentDate, reason, status } = req.body;

      if (!patientId || !doctorId || !appointmentDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check for conflicts
      const hasConflict = await appointmentModel.checkConflict(doctorId, new Date(appointmentDate));
      if (hasConflict) {
        return res.status(409).json({ error: 'Doctor has another appointment at this time. Please choose a different time.' });
      }

      const appointment = await appointmentModel.create(
        patientId,
        doctorId,
        new Date(appointmentDate),
        reason || 'General checkup'
      );

      await auditLogModel.create(
        req.userId || null,
        req.role || null,
        'appointment-created',
        'appointment',
        appointment.id,
        {
          doctorId,
          patientId,
          appointmentDate,
        }
      );

      broadcastRealtimeEvent('appointment-created', {
        appointmentId: appointment.id,
        doctorId,
        patientId,
      });

      res.status(201).json(appointment);
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  },

  updateAppointmentStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const { status } = req.body;

      if (!['completed', 'cancelled', 'no-show', 'scheduled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const appointment = await appointmentModel.updateStatus(appointmentId, status);

      await auditLogModel.create(
        req.userId || null,
        req.role || null,
        'appointment-status-updated',
        'appointment',
        appointmentId,
        { status }
      );

      broadcastRealtimeEvent('appointment-updated', {
        appointmentId,
        status,
      });

      res.json(appointment);
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  },
};
