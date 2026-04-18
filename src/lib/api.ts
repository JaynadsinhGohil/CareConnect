const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

const buildQueryString = (params?: Record<string, string | number | undefined>) => {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') {
      continue;
    }
    searchParams.append(key, String(value));
  }

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : '';
};

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiClient = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};

// Specific API methods
export const doctorApi = {
  getAll: () => apiClient.get('/doctors'),
  getProfile: () => apiClient.get('/doctors/profile'),
  getAppointments: () => apiClient.get('/doctors/appointments'),
  getPatients: () => apiClient.get('/doctors/patients'),
  updatePatientTreatmentStatus: (
    patientId: string,
    data: {
      status: 'new-case' | 'under-treatment' | 'improving' | 'follow-up-required' | 'chronic-monitoring' | 'treatment-completed';
      followUpDate?: string | null;
      dischargeSummary?: string | null;
    }
  ) => apiClient.patch(`/doctors/patients/${patientId}/treatment-status`, data),
  updateAppointmentStatus: (appointmentId: string, status: string) =>
    apiClient.patch(`/doctors/appointments/${appointmentId}/status`, { status }),
  getMedicalRecords: () => apiClient.get('/doctors/medical-records'),
  createMedicalRecord: (data: any) => apiClient.post('/doctors/medical-records', data),
  updateMedicalRecord: (recordId: string, data: any) => apiClient.patch(`/doctors/medical-records/${recordId}`, data),
  getPrescriptions: () => apiClient.get('/doctors/prescriptions'),
  createPrescription: (data: any) => apiClient.post('/doctors/prescriptions', data),
  updatePrescription: (prescriptionId: string, data: any) => apiClient.patch(`/doctors/prescriptions/${prescriptionId}`, data),
};

export const patientApi = {
  getAll: () => apiClient.get('/patients'),
  getProfile: () => apiClient.get('/patients/profile'),
  updateProfile: (data: any) => apiClient.patch('/patients/profile', data),
  getAppointments: () => apiClient.get('/patients/appointments'),
  bookAppointment: (data: any) => apiClient.post('/patients/appointments', data),
  registerPatient: (data: any) => apiClient.post('/patients/register', data),
  getMedicalRecords: () => apiClient.get('/patients/medical-records'),
  getPrescriptions: () => apiClient.get('/patients/prescriptions'),
};

export const adminApi = {
  createStaff: (data: any) => apiClient.post('/admin/staff', data),
  getStaff: () => apiClient.get('/admin/staff'),
  updateStaffStatus: (staffId: string, status: string) =>
    apiClient.patch(`/admin/staff/${staffId}/status`, { status }),
  removeStaff: (staffId: string) => apiClient.delete(`/admin/staff/${staffId}`),
  getDoctors: (params?: { page?: number; pageSize?: number; query?: string }) =>
    apiClient.get(`/admin/doctors${buildQueryString(params)}`),
  getPatients: (params?: { page?: number; pageSize?: number; query?: string }) =>
    apiClient.get(`/admin/patients${buildQueryString(params)}`),
  getAppointments: (params?: {
    page?: number;
    pageSize?: number;
    query?: string;
    date?: string;
    doctorId?: string;
  }) => apiClient.get(`/admin/appointments${buildQueryString(params)}`),
  checkAppointmentConflict: (data: any) => apiClient.post('/admin/appointments/check-conflict', data),
  createAppointment: (data: any) => apiClient.post('/admin/appointments', data),
  updateAppointmentStatus: (appointmentId: string, status: string) =>
    apiClient.patch(`/admin/appointments/${appointmentId}/status`, { status }),
  getMedicalRecords: () => apiClient.get('/admin/medical-records'),
  getPrescriptions: () => apiClient.get('/admin/prescriptions'),
};
