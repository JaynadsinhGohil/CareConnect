import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
export const userModel = {
    findByEmail: async (email) => {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },
    findById: async (id) => {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    },
    create: async (email, passwordHash, firstName, lastName, role) => {
        const id = uuidv4();
        const result = await pool.query('INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id, email, passwordHash, firstName, lastName, role]);
        return result.rows[0];
    },
    update: async (id, data) => {
        const updates = [];
        const values = [];
        let paramCount = 1;
        if (data.first_name !== undefined) {
            updates.push(`first_name = $${paramCount++}`);
            values.push(data.first_name);
        }
        if (data.last_name !== undefined) {
            updates.push(`last_name = $${paramCount++}`);
            values.push(data.last_name);
        }
        if (data.phone !== undefined) {
            updates.push(`phone = $${paramCount++}`);
            values.push(data.phone);
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    },
    getAllByRole: async (role) => {
        const result = await pool.query('SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC', [role]);
        return result.rows;
    },
    updatePassword: async (id, passwordHash) => {
        const result = await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [passwordHash, id]);
        return result.rows[0];
    },
};
export const doctorModel = {
    create: async (userId, specialization) => {
        const id = uuidv4();
        const result = await pool.query('INSERT INTO doctors (id, user_id, specialization) VALUES ($1, $2, $3) RETURNING *', [id, userId, specialization]);
        return result.rows[0];
    },
    findByUserId: async (userId) => {
        const result = await pool.query('SELECT * FROM doctors WHERE user_id = $1', [userId]);
        return result.rows[0];
    },
    getAll: async () => {
        const result = await pool.query(`
      SELECT d.*, u.first_name, u.last_name, u.email, u.phone
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      ORDER BY u.first_name
    `);
        return result.rows;
    },
};
export const patientModel = {
    create: async (userId) => {
        const id = uuidv4();
        const result = await pool.query('INSERT INTO patients (id, user_id) VALUES ($1, $2) RETURNING *', [id, userId]);
        return result.rows[0];
    },
    findByUserId: async (userId) => {
        const result = await pool.query('SELECT * FROM patients WHERE user_id = $1', [userId]);
        return result.rows[0];
    },
    getAll: async () => {
        const result = await pool.query(`
      SELECT p.*, u.first_name, u.last_name, u.email, u.phone
      FROM patients p
      JOIN users u ON p.user_id = u.id
      ORDER BY u.first_name
    `);
        return result.rows;
    },
    update: async (id, data) => {
        const updates = [];
        const values = [];
        let paramCount = 1;
        Object.keys(data).forEach((key) => {
            if (data[key] !== undefined) {
                updates.push(`${key} = $${paramCount++}`);
                values.push(data[key]);
            }
        });
        values.push(id);
        const query = `UPDATE patients SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    },
};
export const appointmentModel = {
    create: async (patientId, doctorId, appointmentDate, reason) => {
        const id = uuidv4();
        const result = await pool.query('INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, reason_for_visit) VALUES ($1, $2, $3, $4, $5) RETURNING *', [id, patientId, doctorId, appointmentDate, reason]);
        return result.rows[0];
    },
    findById: async (id) => {
        const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
        return result.rows[0];
    },
    checkConflict: async (doctorId, appointmentDate) => {
        // Check if doctor has appointment within 1 hour (30 minutes before and 30 minutes after)
        const startTime = new Date(appointmentDate.getTime() - 30 * 60000);
        const endTime = new Date(appointmentDate.getTime() + 30 * 60000);
        const result = await pool.query(`
      SELECT * FROM appointments 
      WHERE doctor_id = $1 
        AND appointment_date >= $2 
        AND appointment_date <= $3
        AND status != 'cancelled'
      LIMIT 1
    `, [doctorId, startTime, endTime]);
        return result.rows.length > 0;
    },
    getByPatient: async (patientId) => {
        const result = await pool.query(`
      SELECT a.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name, d.specialization
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.patient_id = $1
      ORDER BY a.appointment_date DESC
    `, [patientId]);
        return result.rows;
    },
    getByDoctor: async (doctorId) => {
        const result = await pool.query(`
      SELECT a.*, u.first_name as patient_first_name, u.last_name as patient_last_name, p.date_of_birth
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE a.doctor_id = $1
      ORDER BY a.appointment_date DESC
    `, [doctorId]);
        return result.rows;
    },
    getAll: async () => {
        const result = await pool.query(`
      SELECT a.*, 
             pu.first_name as patient_first_name, pu.last_name as patient_last_name,
             du.first_name as doctor_first_name, du.last_name as doctor_last_name,
             d.specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      ORDER BY a.appointment_date DESC
    `);
        return result.rows;
    },
    updateStatus: async (id, status) => {
        const result = await pool.query('UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [status, id]);
        return result.rows[0];
    },
};
export const medicalRecordModel = {
    create: async (patientId, doctorId, appointmentId, diagnosis, treatment_plan, medications) => {
        const id = uuidv4();
        const result = await pool.query('INSERT INTO medical_records (id, patient_id, doctor_id, appointment_id, diagnosis, treatment_plan, medications) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [id, patientId, doctorId, appointmentId, diagnosis, treatment_plan, medications]);
        return result.rows[0];
    },
    getByPatient: async (patientId) => {
        const result = await pool.query(`
      SELECT mr.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM medical_records mr
      LEFT JOIN doctors d ON mr.doctor_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE mr.patient_id = $1
      ORDER BY mr.created_at DESC
    `, [patientId]);
        return result.rows;
    },
    getAll: async () => {
        const result = await pool.query(`
      SELECT mr.*, pu.first_name as patient_first_name, pu.last_name as patient_last_name,
             du.first_name as doctor_first_name, du.last_name as doctor_last_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      LEFT JOIN doctors d ON mr.doctor_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      ORDER BY mr.created_at DESC
    `);
        return result.rows;
    },
};
export const prescriptionModel = {
    create: async (patientId, doctorId, medicationName, dosage, frequency, duration, instructions) => {
        const id = uuidv4();
        const result = await pool.query('INSERT INTO prescriptions (id, patient_id, doctor_id, medication_name, dosage, frequency, duration, instructions, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [id, patientId, doctorId, medicationName, dosage, frequency, duration, instructions, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)]);
        return result.rows[0];
    },
    getByPatient: async (patientId) => {
        const result = await pool.query(`
      SELECT p.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE p.patient_id = $1 AND p.status = 'active'
      ORDER BY p.created_at DESC
    `, [patientId]);
        return result.rows;
    },
    getAll: async () => {
        const result = await pool.query(`
      SELECT p.*, pu.first_name as patient_first_name, pu.last_name as patient_last_name,
             du.first_name as doctor_first_name, du.last_name as doctor_last_name
      FROM prescriptions p
      JOIN patients pat ON p.patient_id = pat.id
      JOIN users pu ON pat.user_id = pu.id
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
    `);
        return result.rows;
    },
};
export const refreshTokenModel = {
    create: async (userId, tokenHash, expiresAt) => {
        const id = uuidv4();
        await pool.query('INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)', [id, userId, tokenHash, expiresAt]);
    },
    findByToken: async (tokenHash) => {
        const result = await pool.query('SELECT * FROM refresh_tokens WHERE token_hash = $1 AND expires_at > CURRENT_TIMESTAMP', [tokenHash]);
        return result.rows[0];
    },
    deleteByUser: async (userId) => {
        await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    },
};
//# sourceMappingURL=index.js.map