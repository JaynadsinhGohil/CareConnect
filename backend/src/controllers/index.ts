import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { doctorModel, appointmentModel, patientModel, medicalRecordModel, prescriptionModel } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';

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

  updateAppointmentStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const { status } = req.body;

      if (!['completed', 'cancelled', 'no-show'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const appointment = await appointmentModel.updateStatus(appointmentId, status);
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
      const { patientId, appointmentId, diagnosis, treatment_plan, medications } = req.body;

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
        medications || ''
      );

      res.status(201).json(record);
    } catch (error) {
      console.error('Create medical record error:', error);
      res.status(500).json({ error: 'Failed to create medical record' });
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
};

export const appointmentController = {
  getAll: async (req: AuthRequest, res: Response) => {
    try {
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
      res.json(appointment);
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  },
};
