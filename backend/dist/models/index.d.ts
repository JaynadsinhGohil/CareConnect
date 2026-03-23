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
export declare const userModel: {
    findByEmail: (email: string) => Promise<any>;
    findByEmailOrPhone: (identifier: string) => Promise<any>;
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
    getAllPaginated: (options: ListQueryOptions) => Promise<{
        items: any[];
        total: any;
        page: number;
        pageSize: number;
    }>;
    getPatientsByDoctor: (doctorId: string) => Promise<any[]>;
};
export declare const patientModel: {
    create: (userId: string) => Promise<any>;
    findByUserId: (userId: string) => Promise<any>;
    getAll: () => Promise<any[]>;
    getAllPaginated: (options: ListQueryOptions) => Promise<{
        items: any[];
        total: any;
        page: number;
        pageSize: number;
    }>;
    update: (id: string, data: any) => Promise<any>;
};
export declare const appointmentModel: {
    create: (patientId: string, doctorId: string, appointmentDate: Date, reason: string) => Promise<any>;
    findById: (id: string) => Promise<any>;
    checkConflict: (doctorId: string, appointmentDate: Date) => Promise<boolean>;
    getByPatient: (patientId: string) => Promise<any[]>;
    getByDoctor: (doctorId: string) => Promise<any[]>;
    getAll: () => Promise<any[]>;
    getAllPaginated: (options: ListQueryOptions) => Promise<{
        items: any[];
        total: any;
        page: number;
        pageSize: number;
    }>;
    updateStatus: (id: string, status: string) => Promise<any>;
};
export declare const medicalRecordModel: {
    create: (patientId: string, doctorId: string, appointmentId: string, diagnosis: string, treatment_plan: string, medications: string, attachments: any[]) => Promise<any>;
    getByPatient: (patientId: string) => Promise<any[]>;
    getAll: () => Promise<any[]>;
    updateByDoctor: (id: string, doctorId: string, diagnosis: string, treatment_plan: string, medications: string, attachments: any[]) => Promise<any>;
};
export declare const prescriptionModel: {
    create: (patientId: string, doctorId: string, medicationName: string, dosage: string, frequency: string, duration: string, instructions: string) => Promise<any>;
    getByPatient: (patientId: string) => Promise<any[]>;
    getAll: () => Promise<any[]>;
    updateByDoctor: (id: string, doctorId: string, medicationName: string, dosage: string, frequency: string, duration: string, instructions: string) => Promise<any>;
};
export declare const refreshTokenModel: {
    create: (userId: string, tokenHash: string, expiresAt: Date) => Promise<void>;
    findByToken: (tokenHash: string) => Promise<any>;
    deleteByUser: (userId: string) => Promise<void>;
};
export declare const auditLogModel: {
    create: (actorUserId: string | null, actorRole: string | null, action: string, targetType: string, targetId: string | null, metadata: Record<string, unknown>) => Promise<void>;
};
export {};
//# sourceMappingURL=index.d.ts.map