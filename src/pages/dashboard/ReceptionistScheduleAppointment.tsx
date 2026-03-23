import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Clock, Phone, AlertCircle, Search } from "lucide-react";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

interface Doctor {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: string;
  years_experience?: number;
  bio?: string;
}

interface Patient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender?: string;
  blood_type?: string;
}

const appointmentStatusColors = {
  confirmed: "bg-success/10 text-success",
  scheduled: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const ReceptionistScheduleAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [isSlotAvailable, setIsSlotAvailable] = useState<boolean | null>(null);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [visibleDoctorCount, setVisibleDoctorCount] = useState(8);
  const [visiblePatientCount, setVisiblePatientCount] = useState(8);

  const [formData, setFormData] = useState({
    doctorId: "",
    patientId: "",
    appointmentDate: "",
    appointmentTime: "09:00",
    reason: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setVisibleDoctorCount(8);
  }, [doctorSearchTerm]);

  useEffect(() => {
    setVisiblePatientCount(8);
  }, [patientSearchTerm]);

  useEffect(() => {
    const { doctorId, appointmentDate, appointmentTime } = formData;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      setConflictError(null);
      setIsSlotAvailable(null);
      return;
    }

    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (Number.isNaN(appointmentDateTime.getTime())) {
      setConflictError("Please select a valid date and time.");
      setIsSlotAvailable(null);
      return;
    }

    const now = new Date();
    if (appointmentDateTime <= now) {
      setConflictError("Appointment must be scheduled for a future date and time.");
      setIsSlotAvailable(null);
      return;
    }

    setConflictError(null);
    setIsCheckingConflict(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const hasConflict = await checkConflict(doctorId, appointmentDateTime.toISOString());
        if (hasConflict) {
          setConflictError("Doctor has another appointment at this time. Please choose a different time.");
          setIsSlotAvailable(false);
        } else {
          setConflictError(null);
          setIsSlotAvailable(true);
        }
      } catch {
        setIsSlotAvailable(null);
      } finally {
        setIsCheckingConflict(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      setIsCheckingConflict(false);
    };
  }, [formData.appointmentDate, formData.appointmentTime, formData.doctorId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
        adminApi.getDoctors(),
        adminApi.getPatients(),
        adminApi.getAppointments(),
      ]);

      if (doctorsRes.error) {
        toast.error(doctorsRes.error);
      } else if (doctorsRes.data) {
        setDoctors(doctorsRes.data as Doctor[]);
      }

      if (patientsRes.error) {
        toast.error(patientsRes.error);
      } else if (patientsRes.data) {
        setPatients(patientsRes.data as Patient[]);
      }

      if (appointmentsRes.error) {
        toast.error(appointmentsRes.error);
      } else if (appointmentsRes.data) {
        setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load doctors and patients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDoctorSelect = (doctorId: string) => {
    setFormData((prev) => ({
      ...prev,
      doctorId,
    }));
    const doctor = doctors.find((d) => d.id === doctorId);
    setSelectedDoctor(doctor || null);
    setConflictError(null);
    setIsSlotAvailable(null);
  };

  const handlePatientSelect = (patientId: string) => {
    setFormData((prev) => ({
      ...prev,
      patientId,
    }));
    const patient = patients.find((p) => p.id === patientId);
    setSelectedPatient(patient || null);
  };

  const checkConflict = async (doctorId: string, dateTime: string) => {
    try {
      const response = await adminApi.checkAppointmentConflict({
        doctorId,
        appointmentDate: dateTime,
      });

      if (response.error) {
        return true; // Assume conflict on error
      }

      return (response.data as any)?.hasConflict || false;
    } catch (error) {
      console.error("Error checking conflict:", error);
      return true; // Assume conflict on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    if (!formData.doctorId || !formData.patientId || !formData.appointmentDate || !formData.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Combine date and time
    const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
    const now = new Date();

    if (appointmentDateTime <= now) {
      toast.error("Appointment must be scheduled for a future date and time");
      return;
    }

    if (isSlotAvailable === false) {
      toast.error("Please choose a conflict-free time slot before scheduling.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for conflict
      const hasConflict = await checkConflict(formData.doctorId, appointmentDateTime.toISOString());
      if (hasConflict) {
        setConflictError("Doctor has another appointment at this time. Please choose a different time.");
        toast.error("Schedule conflict detected. Please choose a different time.");
        setIsSubmitting(false);
        return;
      }

      const response = await adminApi.createAppointment({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentDate: appointmentDateTime.toISOString(),
        reason: formData.reason,
      });

      if (response.error) {
        if (response.error.includes("another appointment")) {
          setConflictError(response.error);
        }
        toast.error(response.error);
      } else {
        toast.success("Appointment scheduled successfully!");
        setTimeout(() => {
          navigate("/dashboard/receptionist");
        }, 2000);
      }
    } catch (error: any) {
      toast.error("Failed to schedule appointment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDoctorInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getPatientInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  // Generate available time slots (30-minute intervals from 9 AM to 5 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = formData.appointmentDate || today;

  const filteredDoctors = doctors.filter((doctor) => {
    const query = doctorSearchTerm.toLowerCase().trim();
    if (!query) return true;

    return (
      `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(query) ||
      doctor.specialization?.toLowerCase().includes(query) ||
      doctor.phone?.toLowerCase().includes(query)
    );
  });

  const filteredPatients = patients.filter((patient) => {
    const query = patientSearchTerm.toLowerCase().trim();
    if (!query) return true;

    return (
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(query) ||
      patient.phone?.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query)
    );
  });

  const visibleDoctors = filteredDoctors.slice(0, visibleDoctorCount);
  const visiblePatients = filteredPatients.slice(0, visiblePatientCount);

  const scheduleAppointments = appointments
    .filter((appointment) => {
      const appointmentDate = new Date(appointment.appointment_date);
      const appointmentDay = new Date(
        appointmentDate.getTime() - appointmentDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      if (appointmentDay !== selectedDate) {
        return false;
      }

      if (!formData.doctorId) {
        return true;
      }

      return appointment.doctor_id === formData.doctorId;
    })
    .sort(
      (a, b) =>
        new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
    );

  return (
    <SimpleDashboardLayout
      role={user?.role || "receptionist"}
      userName={user?.firstName || "User"}
      userId={user?.id?.substring(0, 8)}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Schedule Appointment</h1>
            <p className="text-muted-foreground">Create a new appointment for a patient</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Section - Doctor and Patient Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Select Doctor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select a Doctor
                </CardTitle>
                <CardDescription>Search and select a doctor for this appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={doctorSearchTerm}
                    onChange={(event) => setDoctorSearchTerm(event.target.value)}
                    placeholder="Search by doctor name, specialization, or phone"
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Showing {visibleDoctors.length} of {filteredDoctors.length} doctors
                </p>
                {isLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading doctors...</p>
                ) : doctors.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No doctors available</p>
                ) : (
                  <>
                    <div className="grid gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {visibleDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        onClick={() => handleDoctorSelect(doctor.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.doctorId === doctor.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getDoctorInitials(doctor.first_name, doctor.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">
                              Dr. {doctor.first_name} {doctor.last_name}
                            </p>
                            <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {doctor.years_experience && (
                                <span className="text-xs bg-secondary px-2 py-1 rounded">
                                  {doctor.years_experience} years experience
                                </span>
                              )}
                              <span className="text-xs bg-secondary px-2 py-1 rounded flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {doctor.phone}
                              </span>
                            </div>
                          </div>
                          {formData.doctorId === doctor.id && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-white text-sm">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    </div>
                    {filteredDoctors.length > visibleDoctorCount && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() => setVisibleDoctorCount((prev) => prev + 8)}
                      >
                        Show More Doctors
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Select Patient */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select a Patient
                </CardTitle>
                <CardDescription>Search and select a patient from the registry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={patientSearchTerm}
                    onChange={(event) => setPatientSearchTerm(event.target.value)}
                    placeholder="Search by patient name, email, or phone"
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Showing {visiblePatients.length} of {filteredPatients.length} patients
                </p>
                {isLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading patients...</p>
                ) : patients.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No patients available</p>
                ) : (
                  <>
                    <div className="grid gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {visiblePatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => handlePatientSelect(patient.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.patientId === patient.id
                            ? "border-success bg-success/5"
                            : "border-border hover:border-success/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-success text-white">
                              {getPatientInitials(patient.first_name, patient.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">
                              {patient.first_name} {patient.last_name}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs bg-secondary px-2 py-1 rounded flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {patient.phone}
                              </span>
                              {patient.gender && (
                                <span className="text-xs bg-secondary px-2 py-1 rounded">
                                  {patient.gender}
                                </span>
                              )}
                              {patient.blood_type && (
                                <span className="text-xs bg-secondary px-2 py-1 rounded">
                                  {patient.blood_type}
                                </span>
                              )}
                            </div>
                          </div>
                          {formData.patientId === patient.id && (
                            <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                              <span className="text-white text-sm">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    </div>
                    {filteredPatients.length > visiblePatientCount && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() => setVisiblePatientCount((prev) => prev + 8)}
                      >
                        Show More Patients
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Appointment Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Board
                </CardTitle>
                <CardDescription>
                  {formData.doctorId
                    ? `Appointments for selected doctor on ${new Date(selectedDate).toLocaleDateString()}`
                    : `All doctors on ${new Date(selectedDate).toLocaleDateString()}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading schedule...</p>
                ) : scheduleAppointments.length === 0 ? (
                  <p className="text-muted-foreground">No appointments for this day.</p>
                ) : (
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {scheduleAppointments.slice(0, 12).map((appointment) => (
                      <div key={appointment.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">
                              {new Date(appointment.appointment_date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.patient_first_name} {appointment.patient_last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}
                            </p>
                          </div>
                          <Badge
                            className={`${appointmentStatusColors[
                              appointment.status as keyof typeof appointmentStatusColors
                            ] || "bg-muted text-foreground"}`}
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Appointment Details
                </CardTitle>
                <CardDescription>Set the appointment time and reason</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Conflict Warning */}
                  {conflictError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{conflictError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date
                    </Label>
                    <Input
                      id="appointmentDate"
                      name="appointmentDate"
                      type="date"
                      value={formData.appointmentDate}
                      onChange={handleInputChange}
                      min={today}
                      required
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time
                    </Label>
                    <Select value={formData.appointmentTime} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, appointmentTime: value }))
                    }>
                      <SelectTrigger id="appointmentTime">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isCheckingConflict && (
                      <p className="text-xs text-muted-foreground">Checking slot availability...</p>
                    )}
                    {!isCheckingConflict && isSlotAvailable === true && !conflictError && (
                      <p className="text-xs text-success">This time slot is available.</p>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Visit</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Enter reason for appointment (e.g., Regular checkup, Illness, etc.)"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Selected Summary */}
                  {selectedDoctor && selectedPatient && (
                    <div className="mt-6 space-y-3 border-t pt-4">
                      <div className="text-sm">
                        <p className="text-muted-foreground font-medium">Doctor:</p>
                        <p className="text-foreground font-semibold">
                          Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{selectedDoctor.specialization}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground font-medium">Patient:</p>
                        <p className="text-foreground font-semibold">
                          {selectedPatient.first_name} {selectedPatient.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{selectedPatient.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button type="submit" disabled={isSubmitting} className="w-full mt-6">
                    {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SimpleDashboardLayout>
  );
};

export default ReceptionistScheduleAppointment;
