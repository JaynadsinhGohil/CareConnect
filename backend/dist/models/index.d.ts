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
export declare const userModel: {
    findByEmail: (email: string) => Promise<any>;
    findById: (id: string) => Promise<any>;
    create: (email: string, passwordHash: string, firstName: string, lastName: string, role: string) => Promise<any>;
    update: (id: string, data: Partial<User>) => Promise<any>;
    getAllByRole: (role: string) => Promise<any[]>;
    updatePassword: (id: string, passwordHash: string) => Promise<any>;
};
export declare const doctorModel: {
    create: (userId: string, specialization: string) => Promise<any>;
    findByUserId: (userId: string) => Promise<any>;
    getAll: () => Promise<any[]>;
};
export declare const patientModel: {
    create: (userId: string) => Promise<any>;
    findByUserId: (userId: string) => Promise<any>;
    getAll: () => Promise<any[]>;
    update: (id: string, data: any) => Promise<any>;
};
export declare const appointmentModel: {
    create: (patientId: string, doctorId: string, appointmentDate: Date, reason: string) => Promise<any>;
    findById: (id: string) => Promise<any>;
    getByPatient: (patientId: string) => Promise<any[]>;
    getByDoctor: (doctorId: string) => Promise<any[]>;
    getAll: () => Promise<any[]>;
    updateStatus: (id: string, status: string) => Promise<any>;
};
export declare const medicalRecordModel: {
    create: (patientId: string, doctorId: string, appointmentId: string, diagnosis: string, treatment_plan: string, medications: string) => Promise<any>;
    getByPatient: (patientId: string) => Promise<any[]>;
    getAll: () => Promise<any[]>;
};
export declare const prescriptionModel: {
    create: (patientId: string, doctorId: string, medicationName: string, dosage: string, frequency: string, duration: string, instructions: string) => Promise<any>;
    getByPatient: (patientId: string) => Promise<any[]>;
    getAll: () => Promise<any[]>;
};
export declare const refreshTokenModel: {
    create: (userId: string, tokenHash: string, expiresAt: Date) => Promise<void>;
    findByToken: (tokenHash: string) => Promise<any>;
    deleteByUser: (userId: string) => Promise<void>;
};
//# sourceMappingURL=index.d.ts.map