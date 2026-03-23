import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown, Clock, Search, Stethoscope, UserPlus, Users } from "lucide-react";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const statusColors = {
  confirmed: "bg-success/10 text-success",
  scheduled: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const APPOINTMENTS_PAGE_SIZE = 200;
const DOCTORS_PAGE_SIZE = 50;
const RECENT_PATIENTS_PAGE_SIZE = 5;

const normalizeListResponse = (data: any) => {
  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }

  if (data && Array.isArray(data.items)) {
    return {
      items: data.items,
      total: Number(data.total ?? data.items.length),
    };
  }

  return { items: [], total: 0 };
};

const toLocalDateString = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [totalPatientsCount, setTotalPatientsCount] = useState(0);
  const [totalDoctorsCount, setTotalDoctorsCount] = useState(0);
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("all");
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [isDoctorsPanelOpen, setIsDoctorsPanelOpen] = useState(true);
  const [isQueuePanelOpen, setIsQueuePanelOpen] = useState(true);
  const refreshTimeoutRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
        adminApi.getAppointments({
          page: 1,
          pageSize: APPOINTMENTS_PAGE_SIZE,
          date: selectedDate,
          doctorId: selectedDoctorId !== "all" ? selectedDoctorId : undefined,
          query: patientSearchTerm.trim() || undefined,
        }),
        adminApi.getPatients({
          page: 1,
          pageSize: RECENT_PATIENTS_PAGE_SIZE,
        }),
        adminApi.getDoctors({
          page: 1,
          pageSize: DOCTORS_PAGE_SIZE,
          query: doctorSearchTerm.trim() || undefined,
        }),
      ]);

      if (!appointmentsRes.error && !patientsRes.error && !doctorsRes.error) {
        const normalizedAppointments = normalizeListResponse(appointmentsRes.data);
        const normalizedPatients = normalizeListResponse(patientsRes.data);
        const normalizedDoctors = normalizeListResponse(doctorsRes.data);

        setAppointments(normalizedAppointments.items);
        setPatients(normalizedPatients.items);
        setDoctors(normalizedDoctors.items);

        setTotalAppointmentsCount(normalizedAppointments.total);
        setTotalPatientsCount(normalizedPatients.total);
        setTotalDoctorsCount(normalizedDoctors.total);
      } else {
        setAppointments([]);
        setPatients([]);
        setDoctors([]);
        setTotalAppointmentsCount(0);
        setTotalPatientsCount(0);
        setTotalDoctorsCount(0);
        toast({
          title: "Error",
          description: "Failed to load receptionist board data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setAppointments([]);
      setPatients([]);
      setDoctors([]);
      setTotalAppointmentsCount(0);
      setTotalPatientsCount(0);
      setTotalDoctorsCount(0);
      toast({
        title: "Error",
        description: "Failed to load receptionist board data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [doctorSearchTerm, patientSearchTerm, selectedDate, selectedDoctorId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return;
    }

    const wsBase = API_URL.replace(/\/api\/?$/, "").replace(/^http/, "ws");
    const ws = new WebSocket(`${wsBase}/ws?token=${encodeURIComponent(token)}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        if (data?.type !== "appointment-created" && data?.type !== "appointment-updated") {
          return;
        }

        if (refreshTimeoutRef.current) {
          window.clearTimeout(refreshTimeoutRef.current);
        }

        refreshTimeoutRef.current = window.setTimeout(() => {
          fetchData();
        }, 250);
      } catch {
        // Ignore invalid realtime payloads.
      }
    };

    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
      ws.close();
    };
  }, [fetchData]);

  const handleCheckIn = async (appointmentId: string) => {
    try {
      const result = await adminApi.updateAppointmentStatus(appointmentId, "completed");
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Patient check-in completed.",
        });
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredDoctors = useMemo(() => doctors, [doctors]);

  const selectedDoctor = useMemo(() => {
    if (selectedDoctorId === "all") {
      return null;
    }
    return doctors.find((doctor) => doctor.id === selectedDoctorId) || null;
  }, [doctors, selectedDoctorId]);

  const scheduleItems = useMemo(
    () => [...appointments].sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()),
    [appointments]
  );

  const waitingQueue = useMemo(() => {
    return scheduleItems.filter((appointment) => appointment.status === "scheduled" || appointment.status === "confirmed");
  }, [scheduleItems]);

  const completedTodayCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === "completed").length,
    [appointments]
  );

  const recentPatients = patients.slice(0, 5);

  return (
    <SimpleDashboardLayout
      role="receptionist"
      userName={user?.firstName || "Receptionist"}
      userId={user?.id?.substring(0, 8) || "RCP-00"}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reception Operations Board</h1>
            <p className="text-muted-foreground">Doctor-wise schedule, waiting queue, and check-in actions in one place.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/dashboard/schedule-appointment")}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
            <Button variant="hero" onClick={() => navigate("/dashboard/add-patient")}>
              <UserPlus className="w-4 h-4 mr-2" />
              New Patient
            </Button>
          </div>
        </div>

        <div className="sticky top-2 z-20 space-y-4 rounded-xl bg-background/95 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Card className="border-primary/20 bg-card/80">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Date & Focus Controls</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDoctor
                      ? `Viewing Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`
                      : "Viewing all doctors"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="w-full sm:w-[190px]"
                  />
                  <Button variant="outline" onClick={() => navigate("/dashboard/schedule-appointment")}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Open Scheduler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Registered Patients"
              value={totalPatientsCount.toString()}
              icon={<UserPlus className="w-6 h-6" />}
              description="All patients"
              variant="primary"
            />
            <StatCard
              title="Doctors On Board"
              value={totalDoctorsCount.toString()}
              icon={<Stethoscope className="w-6 h-6" />}
              description="Available profiles"
              variant="success"
            />
            <StatCard
              title="Today Appointments"
              value={totalAppointmentsCount.toString()}
              icon={<Calendar className="w-6 h-6" />}
              description="Filtered by date"
              variant="warning"
            />
            <StatCard
              title="Waiting Queue"
              value={waitingQueue.length.toString()}
              icon={<Users className="w-6 h-6" />}
              description={`${completedTodayCount} completed`}
              variant="accent"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <Collapsible open={isDoctorsPanelOpen} onOpenChange={setIsDoctorsPanelOpen} className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>Doctors</CardTitle>
                    <CardDescription>Select a doctor to focus schedule and queue</CardDescription>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <ChevronDown className={`h-4 w-4 transition-transform ${isDoctorsPanelOpen ? "rotate-0" : "-rotate-90"}`} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={doctorSearchTerm}
                      onChange={(event) => setDoctorSearchTerm(event.target.value)}
                      className="pl-9"
                      placeholder="Search doctor"
                    />
                  </div>

                  <Button
                    variant={selectedDoctorId === "all" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedDoctorId("all")}
                  >
                    All Doctors
                  </Button>

                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {isLoading ? (
                      <p className="text-muted-foreground text-sm">Loading doctors...</p>
                    ) : filteredDoctors.length > 0 ? (
                      filteredDoctors.map((doctor) => (
                        <button
                          key={doctor.id}
                          type="button"
                          onClick={() => setSelectedDoctorId(doctor.id)}
                          className={`w-full text-left rounded-lg border p-3 transition-colors ${
                            selectedDoctorId === doctor.id ? "border-primary bg-primary/5" : "hover:bg-secondary/40"
                          }`}
                        >
                          <p className="font-medium text-sm">Dr. {doctor.first_name} {doctor.last_name}</p>
                          <p className="text-xs text-muted-foreground">{doctor.specialization || "General"}</p>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No matching doctors</p>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Card className="lg:col-span-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <CardTitle>Schedule Board</CardTitle>
                  <CardDescription>
                    {selectedDoctor
                      ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`
                      : "All doctors"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={patientSearchTerm}
                  onChange={(event) => setPatientSearchTerm(event.target.value)}
                  className="pl-9"
                  placeholder="Search patient in selected schedule"
                />
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {isLoading ? (
                  <p className="text-muted-foreground text-sm">Loading appointments...</p>
                ) : scheduleItems.length > 0 ? (
                  scheduleItems.map((appointment) => (
                    <div key={appointment.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm">
                            {appointment.patient_first_name} {appointment.patient_last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}
                          </p>
                        </div>
                        <Badge className={statusColors[appointment.status as keyof typeof statusColors] || "bg-muted text-foreground"}>
                          {appointment.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(appointment.appointment_date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <Button
                          size="sm"
                          disabled={appointment.status === "completed" || appointment.status === "cancelled"}
                          onClick={() => handleCheckIn(appointment.id)}
                        >
                          Check-in
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No appointments for this filter.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <Collapsible open={isQueuePanelOpen} onOpenChange={setIsQueuePanelOpen}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>Waiting Queue</CardTitle>
                      <CardDescription>Patients waiting for consultation</CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <ChevronDown className={`h-4 w-4 transition-transform ${isQueuePanelOpen ? "rotate-0" : "-rotate-90"}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
                    {isLoading ? (
                      <p className="text-muted-foreground text-sm">Loading queue...</p>
                    ) : waitingQueue.length > 0 ? (
                      waitingQueue.map((appointment) => (
                        <div key={appointment.id} className="rounded-lg border p-3">
                          <p className="text-sm font-medium">
                            {appointment.patient_first_name} {appointment.patient_last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(appointment.appointment_date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <Button className="w-full mt-2" size="sm" onClick={() => handleCheckIn(appointment.id)}>
                            Mark Check-in
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Queue is clear for selected filter.</p>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Quick registration follow-up</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <p className="text-muted-foreground text-sm">Loading patients...</p>
                ) : recentPatients.length > 0 ? (
                  <>
                    {recentPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center gap-2 rounded-lg border p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {patient.first_name?.[0]}{patient.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{patient.first_name} {patient.last_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{patient.phone}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-2" onClick={() => navigate("/dashboard/add-patient")}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register New Patient
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent registrations.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SimpleDashboardLayout>
  );
};

export default ReceptionistDashboard;
