import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare const doctorController: {
    createStaff: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getAll: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getAppointments: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getPatients: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateAppointmentStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updatePatientTreatmentStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export declare const patientController: {
    getAll: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    registerPatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getAppointments: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    bookAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getMedicalRecords: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getPrescriptions: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export declare const medicalRecordController: {
    getAll: (req: AuthRequest, res: Response) => Promise<void>;
    create: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    update: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export declare const prescriptionController: {
    getAll: (req: AuthRequest, res: Response) => Promise<void>;
    create: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    update: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export declare const adminController: {
    getStaff: (req: AuthRequest, res: Response) => Promise<void>;
    updateStaffStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteStaff: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export declare const appointmentController: {
    getAll: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    checkConflict: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateAppointmentStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=index.d.ts.map