import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Clock, Phone, AlertCircle } from "lucide-react";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const ReceptionistScheduleAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [doctorsRes, patientsRes] = await Promise.all([
        adminApi.getDoctors(),
        adminApi.getPatients(),
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
                <CardDescription>Choose the doctor for this appointment</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading doctors...</p>
                ) : doctors.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No doctors available</p>
                ) : (
                  <div className="grid gap-3">
                    {doctors.map((doctor) => (
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
                <CardDescription>Choose the patient for this appointment</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading patients...</p>
                ) : patients.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No patients available</p>
                ) : (
                  <div className="grid gap-3">
                    {patients.map((patient) => (
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Appointment Details */}
          <div className="lg:col-span-2">
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
