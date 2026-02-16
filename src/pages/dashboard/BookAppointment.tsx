import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Clock, MapPin, Phone } from "lucide-react";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, patientApi } from "@/lib/api";
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
  available_from?: string;
  available_to?: string;
}

const BookAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "09:00",
    reason: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/doctors");

      if (response.error) {
        toast.error(response.error);
      } else if (response.data) {
        setDoctors(response.data as Doctor[]);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      toast.error("Failed to load available doctors");
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.doctorId || !formData.appointmentDate || !formData.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Combine date and time
    const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
    const now = new Date();

    if (appointmentDateTime < now) {
      toast.error("Please select a future date and time");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await patientApi.bookAppointment({
        doctorId: formData.doctorId,
        appointmentDate: appointmentDateTime.toISOString(),
        reason: formData.reason,
      });

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Appointment booked successfully!");
        setTimeout(() => {
          navigate("/dashboard/patient");
        }, 2000);
      }
    } catch (error: any) {
      toast.error("Failed to book appointment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDoctorInitials = (firstName: string, lastName: string) => {
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
      role={user?.role || "patient"}
      userName={user?.firstName || "User"}
      userId={user?.id?.substring(0, 8)}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
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
            <h1 className="text-2xl font-bold text-foreground">Book an Appointment</h1>
            <p className="text-muted-foreground">Schedule a consultation with one of our doctors</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Available Doctors */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select a Doctor</CardTitle>
                <CardDescription>Choose a doctor for your appointment</CardDescription>
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
                            {doctor.bio && (
                              <p className="text-sm text-muted-foreground mt-2">{doctor.bio}</p>
                            )}
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
          </div>

          {/* Appointment Form */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>Fill in the appointment details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="Describe your symptoms or reason for the visit"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Selected Doctor Summary */}
                  {selectedDoctor && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Doctor Selected:</p>
                      <p className="text-sm font-semibold text-foreground">
                        Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                      </p>
                      <p className="text-xs text-primary">{selectedDoctor.specialization}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.doctorId}
                    className="w-full"
                  >
                    {isSubmitting ? "Booking..." : "Book Appointment"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="w-full"
                  >
                    Cancel
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

export default BookAppointment;
