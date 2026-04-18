import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export const initializeDatabase = async () => {
  try {
    await pool.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'receptionist', 'patient')),
        phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Doctor details
      CREATE TABLE IF NOT EXISTS doctors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        specialization VARCHAR(100),
        license_number VARCHAR(100) UNIQUE,
        years_experience INT,
        bio TEXT,
        avatar_url VARCHAR(500),
        available_from TIME,
        available_to TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Patient details
      CREATE TABLE IF NOT EXISTS patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        date_of_birth DATE,
        gender VARCHAR(20),
        blood_type VARCHAR(10),
        address TEXT,
        emergency_contact VARCHAR(100),
        emergency_phone VARCHAR(20),
        medical_history TEXT,
        allergies TEXT,
        current_medications TEXT,
        treatment_status VARCHAR(50) DEFAULT 'new-case' CHECK (
          treatment_status IN ('new-case', 'under-treatment', 'improving', 'follow-up-required', 'chronic-monitoring', 'treatment-completed')
        ),
        follow_up_date DATE,
        treatment_started_at TIMESTAMP,
        treatment_completed_at TIMESTAMP,
        discharge_summary TEXT,
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Appointments
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_date TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
        reason_for_visit TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Medical Records
      CREATE TABLE IF NOT EXISTS medical_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id UUID REFERENCES doctors(id),
        appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
        diagnosis TEXT,
        treatment_plan TEXT,
        medications TEXT,
        vital_signs JSONB,
        attachments JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Prescriptions
      CREATE TABLE IF NOT EXISTS prescriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        medication_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        duration VARCHAR(100),
        instructions TEXT,
        refills_remaining INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );

      -- Refresh tokens for logout
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Audit logs for operational traceability
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        actor_role VARCHAR(50),
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id UUID,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Backward-compatible migration for existing audit_logs tables
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_user_id UUID;
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_role VARCHAR(50);
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS action VARCHAR(100);
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_type VARCHAR(50);
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_id UUID;
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      -- Backward-compatible migration for existing patients tables
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS treatment_status VARCHAR(50) DEFAULT 'new-case';
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS follow_up_date DATE;
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS treatment_started_at TIMESTAMP;
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS treatment_completed_at TIMESTAMP;
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS discharge_summary TEXT;

      ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_treatment_status_check;
      ALTER TABLE patients ADD CONSTRAINT patients_treatment_status_check
      CHECK (treatment_status IN ('new-case', 'under-treatment', 'improving', 'follow-up-required', 'chronic-monitoring', 'treatment-completed'));

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
      CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
      CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
      CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
      CREATE INDEX IF NOT EXISTS idx_patients_treatment_status ON patients(treatment_status);
      CREATE INDEX IF NOT EXISTS idx_patients_follow_up_date ON patients(follow_up_date);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Seed initial data
export const seedDatabase = async () => {
  try {
    // Check if data already exists
    const result = await pool.query('SELECT COUNT(*) FROM users');
    if (result.rows[0].count > 0) {
      console.log('Database already seeded');
      return;
    }

    // Generate proper bcrypt hash for "password"
    const hashedPassword = await bcrypt.hash('password', 10);

    // Seed admin
    await pool.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone) VALUES
      ('10000000-0000-0000-0000-000000000001', 'admin@careconnect.com', $1, 'System', 'Administrator', 'admin', '+1-555-0100')
    `, [hashedPassword]);

    // Seed doctors
    const doctorRes = await pool.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone) 
      VALUES 
        ('10000000-0000-0000-0000-000000000002', 'doctor@careconnect.com', $1, 'John', 'Smith', 'doctor', '+1-555-0101'),
        ('10000000-0000-0000-0000-000000000003', 'doctor2@careconnect.com', $1, 'Emily', 'Johnson', 'doctor', '+1-555-0102'),
        ('10000000-0000-0000-0000-000000000004', 'doctor3@careconnect.com', $1, 'Marcus', 'Williams', 'doctor', '+1-555-0103')
      RETURNING id
    `, [hashedPassword]);

    // Seed doctor details
    await pool.query(`
      INSERT INTO doctors (user_id, specialization, license_number, years_experience, bio, available_from, available_to) 
      VALUES 
        ('10000000-0000-0000-0000-000000000002', 'General Practice', 'MD-001', 10, 'Experienced in family medicine and patient care', '09:00:00', '17:00:00'),
        ('10000000-0000-0000-0000-000000000003', 'Cardiology', 'MD-002', 8, 'Specialist in heart and cardiovascular diseases', '10:00:00', '18:00:00'),
        ('10000000-0000-0000-0000-000000000004', 'Dermatology', 'MD-003', 6, 'Skin specialist with focus on cosmetic procedures', '08:00:00', '16:00:00')
    `);

    // Seed patients
    await pool.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone) 
      VALUES 
        ('10000000-0000-0000-0000-000000000005', 'patient@careconnect.com', $1, 'Michael', 'Brown', 'patient', '+1-555-0104'),
        ('10000000-0000-0000-0000-000000000006', 'patient2@careconnect.com', $1, 'Sarah', 'Davis', 'patient', '+1-555-0105'),
        ('10000000-0000-0000-0000-000000000007', 'patient3@careconnect.com', $1, 'James', 'Wilson', 'patient', '+1-555-0106'),
        ('10000000-0000-0000-0000-000000000008', 'patient4@careconnect.com', $1, 'Linda', 'Garcia', 'patient', '+1-555-0107')
    `, [hashedPassword]);

    // Seed patient details
    await pool.query(`
      INSERT INTO patients (user_id, date_of_birth, gender, blood_type, address, emergency_contact, emergency_phone) 
      VALUES 
        ('10000000-0000-0000-0000-000000000005', '1990-03-15', 'Male', 'O+', '123 Main St, New York, NY', 'Jane Brown', '+1-555-0108'),
        ('10000000-0000-0000-0000-000000000006', '1985-07-22', 'Female', 'A+', '456 Oak Ave, Boston, MA', 'John Davis', '+1-555-0109'),
        ('10000000-0000-0000-0000-000000000007', '1978-11-30', 'Male', 'B+', '789 Pine Rd, Chicago, IL', 'Mary Wilson', '+1-555-0110'),
        ('10000000-0000-0000-0000-000000000008', '1992-05-18', 'Female', 'AB+', '321 Elm St, Houston, TX', 'Carlos Garcia', '+1-555-0111')
    `);

    // Seed receptionist
    await pool.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone) 
      VALUES 
        ('10000000-0000-0000-0000-000000000009', 'reception@careconnect.com', $1, 'David', 'Martinez', 'receptionist', '+1-555-0112')
    `, [hashedPassword]);

    // Seed appointments
    const now = new Date();
    await pool.query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason_for_visit, notes) 
      VALUES 
        ((SELECT id FROM patients WHERE user_id = '10000000-0000-0000-0000-000000000005'), 
         (SELECT id FROM doctors WHERE user_id = '10000000-0000-0000-0000-000000000002'), 
         $1, 'scheduled', 'Regular checkup', 'Routine physical examination'),
        ((SELECT id FROM patients WHERE user_id = '10000000-0000-0000-0000-000000000006'), 
         (SELECT id FROM doctors WHERE user_id = '10000000-0000-0000-0000-000000000003'), 
         $2, 'completed', 'Heart palpitations', 'ECG performed, normal results'),
        ((SELECT id FROM patients WHERE user_id = '10000000-0000-0000-0000-000000000007'), 
         (SELECT id FROM doctors WHERE user_id = '10000000-0000-0000-0000-000000000004'), 
         $3, 'scheduled', 'Skin consultation', 'Check acne treatment progress'),
        ((SELECT id FROM patients WHERE user_id = '10000000-0000-0000-0000-000000000008'), 
         (SELECT id FROM doctors WHERE user_id = '10000000-0000-0000-0000-000000000002'), 
         $4, 'completed', 'Annual physical', 'All vitals normal, no concerns')
    `, [
      new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
    ]);

    // Seed medical records
    await pool.query(`
      INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment_plan, medications) 
      VALUES 
        ((SELECT id FROM patients WHERE user_id = '10000000-0000-0000-0000-000000000006'), 
         (SELECT id FROM doctors WHERE user_id = '10000000-0000-0000-0000-000000000003'), 
         'Hypertension', 'Monitor blood pressure daily, reduce sodium intake', 'Lisinopril 10mg daily'),
        ((SELECT id FROM patients WHERE user_id = '10000000-0000-0000-0000-000000000008'), 
         (SELECT id FROM doctors WHERE user_id = '10000000-0000-0000-0000-000000000002'), 
         'Type 2 Diabetes', 'Manage weight, regular exercise, monitor glucose levels', 'Metformin 500mg twice daily')
    `);

    // Seed prescriptions
    await pool.query(`
      INSERT INTO prescriptions (patient_id, doctor_id, medication_name, dosage, frequency, duration, instructions, expires_at, status) 
      VALUES 
        ((SELECT id FROM patients WHERE user_id = '10000000-0000-0000-0000-000000000006'), 
         (SELECT id FROM doctors WHERE user_id = '10000000-0000-0000-0000-000000000003'), 
         'Lisinopril', '10mg', 'Once daily in morning', '30 days', 'Take with water, may cause dizziness initially', $1, 'active'),
        ((SELECT id FROM patients WHERE user_id = '10000000-0000-0000-0000-000000000008'), 
         (SELECT id FROM doctors WHERE user_id = '10000000-0000-0000-0000-000000000002'), 
         'Metformin', '500mg', 'Twice daily with meals', '30 days', 'Take with food to minimize stomach upset', $2, 'active'),
        ((SELECT id FROM patients WHERE user_id = '10000000-0000-0000-0000-000000000005'), 
         (SELECT id FROM doctors WHERE user_id = '10000000-0000-0000-0000-000000000002'), 
         'Vitamin D', '1000 IU', 'Once daily', '90 days', 'Take with breakfast', $3, 'active')
    `, [
      new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    ]);

    console.log('✓ Database seeded with comprehensive test data');
    console.log('✓ All demo accounts use password: "password"');
    console.log('\n📋 Demo Accounts:');
    console.log('   Admin: admin@careconnect.com');
    console.log('   Doctor: doctor@careconnect.com, doctor2@careconnect.com, doctor3@careconnect.com');
    console.log('   Receptionist: reception@careconnect.com');
    console.log('   Patient: patient@careconnect.com, patient2@careconnect.com, patient3@careconnect.com, patient4@careconnect.com');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
