import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'patient';
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  updated_at: Date;
}

interface ListQueryOptions {
  page?: number;
  pageSize?: number;
  query?: string;
  date?: string;
  doctorId?: string;
}

export const userModel = {
  findByEmail: async (email: string) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  findByEmailOrPhone: async (identifier: string) => {
    const normalizedIdentifier = identifier.replace(/\D/g, '');
    const result = await pool.query(
      `
        SELECT *
        FROM users
        WHERE lower(email) = lower($1)
          OR phone = $1
          OR (regexp_replace(phone, '\\D', '', 'g') = $2 AND $2 <> '')
        LIMIT 1
      `,
      [identifier, normalizedIdentifier]
    );
    return result.rows[0];
  },

  findById: async (id: string) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async (email: string, passwordHash: string, firstName: string, lastName: string, role: string) => {
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, email, passwordHash, firstName, lastName, role]
    );
    return result.rows[0];
  },

  update: async (id: string, data: Partial<User>) => {
    const updates: string[] = [];
    const values: any[] = [];
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

  getAllByRole: async (role: string) => {
    const result = await pool.query('SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC', [role]);
    return result.rows;
  },

  updatePassword: async (id: string, passwordHash: string) => {
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [passwordHash, id]
    );
    return result.rows[0];
  },
};

export const doctorModel = {
  create: async (userId: string, specialization: string) => {
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO doctors (id, user_id, specialization) VALUES ($1, $2, $3) RETURNING *',
      [id, userId, specialization]
    );
    return result.rows[0];
  },

  findByUserId: async (userId: string) => {
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

  getAllPaginated: async (options: ListQueryOptions) => {
    const page = Math.max(1, Number(options.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(options.pageSize || 20)));
    const query = (options.query || '').trim();
    const normalizedQuery = query.replace(/\D/g, '');

    const values: any[] = [];
    const whereClauses: string[] = [];

    if (query) {
      values.push(`%${query}%`);
      const textQueryParam = values.length;

      values.push(normalizedQuery);
      const phoneQueryParam = values.length;

      whereClauses.push(
        `(
          u.first_name ILIKE $${textQueryParam}
          OR u.last_name ILIKE $${textQueryParam}
          OR d.specialization ILIKE $${textQueryParam}
          OR u.phone ILIKE $${textQueryParam}
          OR ($${phoneQueryParam} <> '' AND regexp_replace(u.phone, '\\D', '', 'g') LIKE '%' || $${phoneQueryParam} || '%')
        )`
      );
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    values.push(pageSize);
    const limitParam = values.length;
    values.push((page - 1) * pageSize);
    const offsetParam = values.length;

    const rowsResult = await pool.query(
      `
        SELECT d.*, u.first_name, u.last_name, u.email, u.phone
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        ${whereSql}
        ORDER BY u.first_name, u.last_name
        LIMIT $${limitParam} OFFSET $${offsetParam}
      `,
      values
    );

    const countValues = values.slice(0, values.length - 2);
    const countResult = await pool.query(
      `
        SELECT COUNT(*)::int AS total
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        ${whereSql}
      `,
      countValues
    );

    return {
      items: rowsResult.rows,
      total: countResult.rows[0]?.total || 0,
      page,
      pageSize,
    };
  },

  getPatientsByDoctor: async (doctorId: string) => {
    const result = await pool.query(
      `
        SELECT DISTINCT
          p.id,
          p.date_of_birth,
          p.gender,
          p.blood_type,
          p.medical_history,
          p.allergies,
          p.current_medications,
          p.treatment_status,
          p.follow_up_date,
          p.treatment_started_at,
          p.treatment_completed_at,
          p.discharge_summary,
          u.first_name,
          u.last_name,
          u.email,
          u.phone
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE a.doctor_id = $1
        ORDER BY u.first_name, u.last_name
      `,
      [doctorId]
    );
    return result.rows;
  },

  hasPatient: async (doctorId: string, patientId: string) => {
    const result = await pool.query(
      `
        SELECT 1
        FROM appointments
        WHERE doctor_id = $1 AND patient_id = $2
        LIMIT 1
      `,
      [doctorId, patientId]
    );
    return result.rows.length > 0;
  },

  updatePatientTreatmentStatus: async (
    patientId: string,
    status: 'new-case' | 'under-treatment' | 'improving' | 'follow-up-required' | 'chronic-monitoring' | 'treatment-completed',
    followUpDate?: string | null,
    dischargeSummary?: string | null
  ) => {
    const result = await pool.query(
      `
        UPDATE patients
        SET treatment_status = $1::varchar,
            follow_up_date = $2,
            discharge_summary = CASE
              WHEN $1::varchar = 'treatment-completed' THEN $3
              ELSE COALESCE($3, discharge_summary)
            END,
            treatment_started_at = CASE
              WHEN $1::varchar IN ('under-treatment', 'improving', 'follow-up-required', 'chronic-monitoring')
                THEN COALESCE(treatment_started_at, CURRENT_TIMESTAMP)
              ELSE treatment_started_at
            END,
            treatment_completed_at = CASE
              WHEN $1::varchar = 'treatment-completed' THEN CURRENT_TIMESTAMP
              ELSE NULL
            END
        WHERE id = $4
        RETURNING *
      `,
      [status, followUpDate ?? null, dischargeSummary ?? null, patientId]
    );
    return result.rows[0];
  },
};

export const patientModel = {
  create: async (userId: string) => {
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO patients (id, user_id) VALUES ($1, $2) RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  },

  findByUserId: async (userId: string) => {
    const result = await pool.query('SELECT * FROM patients WHERE user_id = $1', [userId]);
    return result.rows[0];
  },

  findById: async (id: string) => {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
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

  getAllPaginated: async (options: ListQueryOptions) => {
    const page = Math.max(1, Number(options.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(options.pageSize || 20)));
    const query = (options.query || '').trim();
    const normalizedQuery = query.replace(/\D/g, '');

    const values: any[] = [];
    const whereClauses: string[] = [];

    if (query) {
      values.push(`%${query}%`);
      const textQueryParam = values.length;

      values.push(normalizedQuery);
      const phoneQueryParam = values.length;

      whereClauses.push(
        `(
          u.first_name ILIKE $${textQueryParam}
          OR u.last_name ILIKE $${textQueryParam}
          OR u.email ILIKE $${textQueryParam}
          OR u.phone ILIKE $${textQueryParam}
          OR ($${phoneQueryParam} <> '' AND regexp_replace(u.phone, '\\D', '', 'g') LIKE '%' || $${phoneQueryParam} || '%')
        )`
      );
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    values.push(pageSize);
    const limitParam = values.length;
    values.push((page - 1) * pageSize);
    const offsetParam = values.length;

    const rowsResult = await pool.query(
      `
        SELECT p.*, u.first_name, u.last_name, u.email, u.phone
        FROM patients p
        JOIN users u ON p.user_id = u.id
        ${whereSql}
        ORDER BY u.first_name, u.last_name
        LIMIT $${limitParam} OFFSET $${offsetParam}
      `,
      values
    );

    const countValues = values.slice(0, values.length - 2);
    const countResult = await pool.query(
      `
        SELECT COUNT(*)::int AS total
        FROM patients p
        JOIN users u ON p.user_id = u.id
        ${whereSql}
      `,
      countValues
    );

    return {
      items: rowsResult.rows,
      total: countResult.rows[0]?.total || 0,
      page,
      pageSize,
    };
  },

  update: async (id: string, data: any) => {
    const updates: string[] = [];
    const values: any[] = [];
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
  create: async (patientId: string, doctorId: string, appointmentDate: Date, reason: string) => {
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, reason_for_visit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, patientId, doctorId, appointmentDate, reason]
    );
    return result.rows[0];
  },

  findById: async (id: string) => {
    const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
    return result.rows[0];
  },

  checkConflict: async (doctorId: string, appointmentDate: Date) => {
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

  getByPatient: async (patientId: string) => {
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

  getByDoctor: async (doctorId: string) => {
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

  getAllPaginated: async (options: ListQueryOptions) => {
    const page = Math.max(1, Number(options.page || 1));
    const pageSize = Math.min(200, Math.max(1, Number(options.pageSize || 30)));
    const query = (options.query || '').trim();
    const normalizedQuery = query.replace(/\D/g, '');

    const values: any[] = [];
    const whereClauses: string[] = [];

    if (options.date) {
      values.push(options.date);
      const dateParam = values.length;
      whereClauses.push(`DATE(a.appointment_date) = $${dateParam}`);
    }

    if (options.doctorId) {
      values.push(options.doctorId);
      const doctorParam = values.length;
      whereClauses.push(`a.doctor_id = $${doctorParam}`);
    }

    if (query) {
      values.push(`%${query}%`);
      const textQueryParam = values.length;

      values.push(normalizedQuery);
      const phoneQueryParam = values.length;

      whereClauses.push(
        `(
          pu.first_name ILIKE $${textQueryParam}
          OR pu.last_name ILIKE $${textQueryParam}
          OR pu.phone ILIKE $${textQueryParam}
          OR du.first_name ILIKE $${textQueryParam}
          OR du.last_name ILIKE $${textQueryParam}
          OR ($${phoneQueryParam} <> '' AND regexp_replace(pu.phone, '\\D', '', 'g') LIKE '%' || $${phoneQueryParam} || '%')
        )`
      );
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    values.push(pageSize);
    const limitParam = values.length;
    values.push((page - 1) * pageSize);
    const offsetParam = values.length;

    const rowsResult = await pool.query(
      `
        SELECT a.*,
               pu.first_name as patient_first_name, pu.last_name as patient_last_name,
               pu.phone as patient_phone,
               du.first_name as doctor_first_name, du.last_name as doctor_last_name,
               d.specialization
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users pu ON p.user_id = pu.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        ${whereSql}
        ORDER BY a.appointment_date DESC
        LIMIT $${limitParam} OFFSET $${offsetParam}
      `,
      values
    );

    const countValues = values.slice(0, values.length - 2);
    const countResult = await pool.query(
      `
        SELECT COUNT(*)::int AS total
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users pu ON p.user_id = pu.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        ${whereSql}
      `,
      countValues
    );

    return {
      items: rowsResult.rows,
      total: countResult.rows[0]?.total || 0,
      page,
      pageSize,
    };
  },

  updateStatus: async (id: string, status: string) => {
    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },
};

export const medicalRecordModel = {
  create: async (
    patientId: string,
    doctorId: string,
    appointmentId: string,
    diagnosis: string,
    treatment_plan: string,
    medications: string,
    attachments: any[]
  ) => {
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO medical_records (id, patient_id, doctor_id, appointment_id, diagnosis, treatment_plan, medications, attachments) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, patientId, doctorId, appointmentId, diagnosis, treatment_plan, medications, JSON.stringify(attachments || [])]
    );
    return result.rows[0];
  },

  getByPatient: async (patientId: string) => {
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

  updateByDoctor: async (
    id: string,
    doctorId: string,
    diagnosis: string,
    treatment_plan: string,
    medications: string,
    attachments: any[]
  ) => {
    const result = await pool.query(
      `
        UPDATE medical_records
        SET diagnosis = $1,
            treatment_plan = $2,
            medications = $3,
            attachments = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 AND doctor_id = $6
        RETURNING *
      `,
      [diagnosis, treatment_plan, medications, JSON.stringify(attachments || []), id, doctorId]
    );
    return result.rows[0];
  },
};

export const prescriptionModel = {
  create: async (patientId: string, doctorId: string, medicationName: string, dosage: string, frequency: string, duration: string, instructions: string) => {
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO prescriptions (id, patient_id, doctor_id, medication_name, dosage, frequency, duration, instructions, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [id, patientId, doctorId, medicationName, dosage, frequency, duration, instructions, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)]
    );
    return result.rows[0];
  },

  getByPatient: async (patientId: string) => {
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

  updateByDoctor: async (
    id: string,
    doctorId: string,
    medicationName: string,
    dosage: string,
    frequency: string,
    duration: string,
    instructions: string
  ) => {
    const result = await pool.query(
      `
        UPDATE prescriptions
        SET medication_name = $1,
            dosage = $2,
            frequency = $3,
            duration = $4,
            instructions = $5
        WHERE id = $6 AND doctor_id = $7
        RETURNING *
      `,
      [medicationName, dosage, frequency, duration, instructions, id, doctorId]
    );
    return result.rows[0];
  },
};

export const refreshTokenModel = {
  create: async (userId: string, tokenHash: string, expiresAt: Date) => {
    const id = uuidv4();
    await pool.query(
      'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
      [id, userId, tokenHash, expiresAt]
    );
  },

  findByToken: async (tokenHash: string) => {
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND expires_at > CURRENT_TIMESTAMP',
      [tokenHash]
    );
    return result.rows[0];
  },

  deleteByUser: async (userId: string) => {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  },
};

export const auditLogModel = {
  create: async (
    actorUserId: string | null,
    actorRole: string | null,
    action: string,
    targetType: string,
    targetId: string | null,
    metadata: Record<string, unknown>
  ) => {
    const id = uuidv4();
    await pool.query(
      `
        INSERT INTO audit_logs (id, actor_user_id, actor_role, action, target_type, target_id, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [id, actorUserId, actorRole, action, targetType, targetId, JSON.stringify(metadata)]
    );
  },
};
