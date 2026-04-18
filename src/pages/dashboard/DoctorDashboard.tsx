import { useEffect, useMemo, useState } from "react";
import { Calendar, FileText, Users, Clock, PenSquare, XCircle, CheckCircle2, Activity, AlertTriangle, ClipboardCheck } from "lucide-react";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { doctorApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const appointmentStatusColors = {
  completed: "bg-success/10 text-success border-success/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  scheduled: "bg-secondary text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  "no-show": "bg-accent/10 text-accent border-accent/20",
};

type TreatmentStatus =
  | "new-case"
  | "under-treatment"
  | "improving"
  | "follow-up-required"
  | "chronic-monitoring"
  | "treatment-completed";

const treatmentStatusAliasMap: Record<string, TreatmentStatus> = {
  "new-case": "new-case",
  "new case": "new-case",
  "under-treatment": "under-treatment",
  "under treatment": "under-treatment",
  "under_treatment": "under-treatment",
  improving: "improving",
  "follow-up-required": "follow-up-required",
  "follow up required": "follow-up-required",
  "follow_up_required": "follow-up-required",
  "chronic-monitoring": "chronic-monitoring",
  "chronic monitoring": "chronic-monitoring",
  "chronic_monitoring": "chronic-monitoring",
  "treatment-completed": "treatment-completed",
  "treatment completed": "treatment-completed",
  completed: "treatment-completed",
  discharged: "treatment-completed",
};

const normalizeTreatmentStatus = (value: unknown): TreatmentStatus => {
  if (typeof value !== "string") {
    return "new-case";
  }

  return treatmentStatusAliasMap[value.trim().toLowerCase()] || "new-case";
};

const treatmentStatusColors: Record<TreatmentStatus, string> = {
  "new-case": "bg-slate-100 text-slate-700 border-slate-200",
  "under-treatment": "bg-blue-100 text-blue-700 border-blue-200",
  improving: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "follow-up-required": "bg-amber-100 text-amber-700 border-amber-200",
  "chronic-monitoring": "bg-violet-100 text-violet-700 border-violet-200",
  "treatment-completed": "bg-teal-100 text-teal-700 border-teal-200",
};

const treatmentStatusLabels: Record<TreatmentStatus, string> = {
  "new-case": "New Case",
  "under-treatment": "Under Treatment",
  improving: "Improving",
  "follow-up-required": "Follow-up Required",
  "chronic-monitoring": "Chronic Monitoring",
  "treatment-completed": "Treatment Completed",
};

const normalizeDateForInput = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

const COMMENT_LABEL = "Doctor Comment:";
const TESTS_LABEL = "Recommended Tests:";

const toDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

type AttachmentItem = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

const parseTreatmentPlan = (treatmentPlan: string) => {
  if (!treatmentPlan) return { comment: "", tests: "" };

  if (!treatmentPlan.includes(COMMENT_LABEL) && !treatmentPlan.includes(TESTS_LABEL)) {
    return { comment: treatmentPlan.trim(), tests: "" };
  }

  const commentStart = treatmentPlan.indexOf(COMMENT_LABEL);
  const testsStart = treatmentPlan.indexOf(TESTS_LABEL);

  let comment = "";
  let tests = "";

  if (commentStart >= 0) {
    const commentContentStart = commentStart + COMMENT_LABEL.length;
    const commentContentEnd = testsStart > commentStart ? testsStart : treatmentPlan.length;
    comment = treatmentPlan.slice(commentContentStart, commentContentEnd).trim();
  }

  if (testsStart >= 0) {
    const testsContentStart = testsStart + TESTS_LABEL.length;
    tests = treatmentPlan.slice(testsContentStart).trim();
  }

  return { comment, tests };
};

const buildTreatmentPlan = (comment: string, tests: string) => {
  const sections: string[] = [];
  sections.push(`${COMMENT_LABEL}\n${comment.trim()}`);
  if (tests.trim()) {
    sections.push(`${TESTS_LABEL}\n${tests.trim()}`);
  }
  return sections.join("\n\n");
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [appointmentFilter, setAppointmentFilter] = useState<"all" | "today" | "upcoming" | "past" | "scheduled" | "completed" | "cancelled">("all");
  const [patientStatusFilter, setPatientStatusFilter] = useState<"all" | TreatmentStatus>("all");
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [recordSearch, setRecordSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false);
  const [isClinicalDialogOpen, setIsClinicalDialogOpen] = useState(false);
  const [isTreatmentDialogOpen, setIsTreatmentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clinicalForm, setClinicalForm] = useState({
    diagnosis: "",
    comment: "",
    tests: "",
    medications: "",
    attachments: [] as AttachmentItem[],
  });

  const [treatmentForm, setTreatmentForm] = useState<{
    patientId: string;
    patientName: string;
    status: TreatmentStatus;
    followUpDate: string;
    dischargeSummary: string;
  }>({
    patientId: "",
    patientName: "",
    status: "under-treatment",
    followUpDate: "",
    dischargeSummary: "",
  });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, appointmentsRes, patientsRes, recordsRes] = await Promise.all([
        doctorApi.getProfile(),
        doctorApi.getAppointments(),
        doctorApi.getPatients(),
        doctorApi.getMedicalRecords(),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (appointmentsRes.data) setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      if (patientsRes.data) setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
      if (recordsRes.data) setRecords(Array.isArray(recordsRes.data) ? recordsRes.data : []);

      if (profileRes.error || appointmentsRes.error || recordsRes.error) {
        console.error("Failed to fetch doctor dashboard data");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const today = toDateOnly(new Date());
  const scheduledCount = appointments.filter((a) => a.status === "scheduled").length;
  const todayAppointments = appointments.filter((a) => toDateOnly(new Date(a.appointment_date)).getTime() === today.getTime());
  const futureAppointments = appointments.filter((a) => toDateOnly(new Date(a.appointment_date)).getTime() > today.getTime());
  const pastAppointments = appointments.filter((a) => toDateOnly(new Date(a.appointment_date)).getTime() < today.getTime() || a.status === "completed");

  const underTreatmentCount = patients.filter((p) => ["under-treatment", "improving", "follow-up-required", "chronic-monitoring"].includes(normalizeTreatmentStatus(p.treatment_status))).length;
  const followUpDueTodayCount = patients.filter((p) => {
    if (!p.follow_up_date || normalizeTreatmentStatus(p.treatment_status) === "treatment-completed") return false;
    return toDateOnly(new Date(p.follow_up_date)).getTime() === today.getTime();
  }).length;
  const followUpOverdueCount = patients.filter((p) => {
    if (!p.follow_up_date || normalizeTreatmentStatus(p.treatment_status) === "treatment-completed") return false;
    return toDateOnly(new Date(p.follow_up_date)).getTime() < today.getTime();
  }).length;
  const completedTreatmentCount = patients.filter((p) => normalizeTreatmentStatus(p.treatment_status) === "treatment-completed").length;

  const normalizedAppointmentSearch = appointmentSearch.trim().toLowerCase();
  const filteredAppointments = appointments
    .filter((appointment) => {
      const appointmentDay = toDateOnly(new Date(appointment.appointment_date)).getTime();

      if (appointmentFilter === "today") return appointmentDay === today.getTime();
      if (appointmentFilter === "upcoming") return appointmentDay > today.getTime();
      if (appointmentFilter === "past") return appointmentDay < today.getTime() || appointment.status === "completed";
      if (appointmentFilter === "scheduled") return appointment.status === "scheduled";
      if (appointmentFilter === "completed") return appointment.status === "completed";
      if (appointmentFilter === "cancelled") return appointment.status === "cancelled";
      return true;
    })
    .filter((appointment) => {
      if (!normalizedAppointmentSearch) return true;

      const searchableText = `${appointment.patient_first_name || ""} ${appointment.patient_last_name || ""} ${appointment.reason_for_visit || ""}`.toLowerCase();
      return searchableText.includes(normalizedAppointmentSearch);
    });

  const normalizedPatientSearch = patientSearch.trim().toLowerCase();
  const filteredPatients = patients
    .filter((patient) => {
      if (patientStatusFilter === "all") return true;
      return normalizeTreatmentStatus(patient.treatment_status) === patientStatusFilter;
    })
    .filter((patient) => {
      if (!normalizedPatientSearch) return true;

      const searchableText = `${patient.first_name || ""} ${patient.last_name || ""} ${patient.email || ""} ${patient.phone || ""}`.toLowerCase();
      return searchableText.includes(normalizedPatientSearch);
    });

  const normalizedRecordSearch = recordSearch.trim().toLowerCase();
  const filteredRecords = records.filter((record) => {
    if (!normalizedRecordSearch) return true;

    const searchableText = `${record.patient_first_name || ""} ${record.patient_last_name || ""} ${record.diagnosis || ""} ${record.medications || ""} ${record.treatment_plan || ""}`.toLowerCase();
    return searchableText.includes(normalizedRecordSearch);
  });

  const followUpQueue = useMemo(() => {
    const withFollowUp = patients
      .filter((patient) => patient.follow_up_date && normalizeTreatmentStatus(patient.treatment_status) !== "treatment-completed")
      .map((patient) => ({
        ...patient,
        followUpTime: toDateOnly(new Date(patient.follow_up_date)).getTime(),
      }))
      .sort((a, b) => a.followUpTime - b.followUpTime);

    return {
      overdue: withFollowUp.filter((patient) => patient.followUpTime < today.getTime()).slice(0, 5),
      dueToday: withFollowUp.filter((patient) => patient.followUpTime === today.getTime()).slice(0, 5),
    };
  }, [patients, today]);

  const uniquePatients = appointments.reduce((acc: any[], apt: any) => {
    if (!acc.find((p) => p.patient_id === apt.patient_id)) {
      acc.push({
        patient_id: apt.patient_id,
        patient_first_name: apt.patient_first_name,
        patient_last_name: apt.patient_last_name,
      });
    }
    return acc;
  }, []);

  const patientTimeline = useMemo(() => {
    if (!selectedPatient) return [] as Array<{ id: string; type: "appointment" | "record"; date: Date; label: string; meta: string }>;

    const appointmentItems = appointments
      .filter((appointment) => appointment.patient_id === selectedPatient.id)
      .map((appointment) => ({
        id: `apt-${appointment.id}`,
        type: "appointment" as const,
        date: new Date(appointment.appointment_date),
        label: `Appointment: ${appointment.reason_for_visit || "General consultation"}`,
        meta: appointment.status,
      }));

    const recordItems = records
      .filter((record) => record.patient_id === selectedPatient.id)
      .map((record) => ({
        id: `rec-${record.id}`,
        type: "record" as const,
        date: new Date(record.updated_at || record.created_at),
        label: `Clinical update: ${record.diagnosis || "N/A"}`,
        meta: "record",
      }));

    return [...appointmentItems, ...recordItems].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [appointments, records, selectedPatient]);

  const resetClinicalForm = () => {
    setClinicalForm({ diagnosis: "", comment: "", tests: "", medications: "", attachments: [] });
  };

  const openNewClinicalUpdate = (patientId: string, patientName: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientName(patientName);
    setEditingRecordId(null);
    resetClinicalForm();
    setIsClinicalDialogOpen(true);
  };

  const openPatientDetails = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId) || null;
    setSelectedPatient(patient);
    setIsPatientDetailsOpen(true);
  };

  const openEditClinicalUpdate = (record: any) => {
    const parsedPlan = parseTreatmentPlan(record.treatment_plan || "");

    setSelectedPatientId(record.patient_id);
    setSelectedPatientName(`${record.patient_first_name || ""} ${record.patient_last_name || ""}`.trim() || "Patient");
    setEditingRecordId(record.id);
    setClinicalForm({
      diagnosis: record.diagnosis || "",
      comment: parsedPlan.comment,
      tests: parsedPlan.tests,
      medications: record.medications || "",
      attachments: Array.isArray(record.attachments) ? record.attachments : [],
    });
    setIsClinicalDialogOpen(true);
  };

  const openTreatmentDialog = (patient: any, status: TreatmentStatus) => {
    setTreatmentForm({
      patientId: patient.id,
      patientName: `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || "Patient",
      status,
      followUpDate: normalizeDateForInput(patient.follow_up_date),
      dischargeSummary: status === "treatment-completed" ? patient.discharge_summary || "" : "",
    });
    setIsTreatmentDialogOpen(true);
  };

  const handleAttachmentUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const nextAttachments = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<AttachmentItem>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                name: file.name,
                type: file.type || "application/octet-stream",
                size: file.size,
                dataUrl: String(reader.result || ""),
              });
            };
            reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
            reader.readAsDataURL(file);
          })
      )
    );

    setClinicalForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...nextAttachments],
    }));
  };

  const removeAttachment = (index: number) => {
    setClinicalForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, idx) => idx !== index),
    }));
  };

  const handleAppointmentStatusUpdate = async (appointmentId: string, status: "completed" | "cancelled") => {
    try {
      const response = await doctorApi.updateAppointmentStatus(appointmentId, status);
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchDashboardData();
      toast.success(`Appointment ${status} successfully.`);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} appointment.`);
    }
  };

  const handleSaveClinicalUpdate = async () => {
    if (!selectedPatientId || !clinicalForm.diagnosis.trim() || !clinicalForm.comment.trim()) {
      toast.error("Diagnosis and doctor comment are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patientId: selectedPatientId,
        diagnosis: clinicalForm.diagnosis,
        treatment_plan: buildTreatmentPlan(clinicalForm.comment, clinicalForm.tests),
        medications: clinicalForm.medications,
        attachments: clinicalForm.attachments,
      };

      const response = editingRecordId
        ? await doctorApi.updateMedicalRecord(editingRecordId, payload)
        : await doctorApi.createMedicalRecord(payload);

      if (response.error) {
        throw new Error(response.error);
      }

      await fetchDashboardData();
      setIsClinicalDialogOpen(false);
      setEditingRecordId(null);
      resetClinicalForm();
      toast.success(editingRecordId ? "Clinical update modified successfully." : "Clinical update added successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to save clinical update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTreatmentStatus = async () => {
    if (!treatmentForm.patientId) {
      toast.error("Select a valid patient.");
      return;
    }

    if (treatmentForm.status === "treatment-completed" && !treatmentForm.dischargeSummary.trim()) {
      toast.error("Discharge summary is required to mark treatment completed.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await doctorApi.updatePatientTreatmentStatus(treatmentForm.patientId, {
        status: normalizeTreatmentStatus(treatmentForm.status),
        followUpDate: treatmentForm.followUpDate || null,
        dischargeSummary: treatmentForm.dischargeSummary || null,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      await fetchDashboardData();
      if (selectedPatient?.id === treatmentForm.patientId) {
        const refreshed = patients.find((p) => p.id === treatmentForm.patientId);
        if (refreshed) {
          setSelectedPatient(refreshed);
        }
      }
      setIsTreatmentDialogOpen(false);
      toast.success("Patient treatment status updated.");
    } catch (error: any) {
      toast.error(error.message || "Failed to update treatment status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SimpleDashboardLayout role="doctor" userName={`Dr. ${user?.lastName}`} userId={user?.id?.substring(0, 8) || "DR-00"}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doctor Care Command Center</h1>
            <p className="text-muted-foreground">{scheduledCount} scheduled appointments and {followUpOverdueCount} overdue follow-ups require review.</p>
          </div>
          <Button
            variant="hero"
            onClick={() => {
              if (uniquePatients.length === 0) {
                toast.info("No patients found from appointments yet.");
                return;
              }
              const firstPatient = uniquePatients[0];
              openNewClinicalUpdate(
                firstPatient.patient_id,
                `${firstPatient.patient_first_name} ${firstPatient.patient_last_name}`
              );
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            New Clinical Update
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Under Treatment"
            value={underTreatmentCount.toString()}
            icon={<Activity className="w-6 h-6" />}
            description="Active care episodes"
            variant="primary"
          />
          <StatCard
            title="Follow-up Due Today"
            value={followUpDueTodayCount.toString()}
            icon={<Clock className="w-6 h-6" />}
            description="Needs doctor review"
            variant="warning"
          />
          <StatCard
            title="Overdue Follow-ups"
            value={followUpOverdueCount.toString()}
            icon={<AlertTriangle className="w-6 h-6" />}
            description="High-priority queue"
            variant="accent"
          />
          <StatCard
            title="Completed Cases"
            value={completedTreatmentCount.toString()}
            icon={<ClipboardCheck className="w-6 h-6" />}
            description="Marked fit/discharged"
            variant="success"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Appointments</CardTitle>
                  <CardDescription>Present, past, and future appointments with management</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAppointmentFilter("today");
                    setAppointmentSearch("");
                    toast.info("Showing today's appointments.");
                  }}
                >
                  Focus Today
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <Input
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  placeholder="Search by patient or visit reason"
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={appointmentFilter === "all" ? "default" : "outline"} onClick={() => setAppointmentFilter("all")}>All</Button>
                  <Button size="sm" variant={appointmentFilter === "today" ? "default" : "outline"} onClick={() => setAppointmentFilter("today")}>Today</Button>
                  <Button size="sm" variant={appointmentFilter === "upcoming" ? "default" : "outline"} onClick={() => setAppointmentFilter("upcoming")}>Upcoming</Button>
                  <Button size="sm" variant={appointmentFilter === "past" ? "default" : "outline"} onClick={() => setAppointmentFilter("past")}>Past</Button>
                  <Button size="sm" variant={appointmentFilter === "scheduled" ? "default" : "outline"} onClick={() => setAppointmentFilter("scheduled")}>Scheduled</Button>
                  <Button size="sm" variant={appointmentFilter === "completed" ? "default" : "outline"} onClick={() => setAppointmentFilter("completed")}>Completed</Button>
                  <Button size="sm" variant={appointmentFilter === "cancelled" ? "default" : "outline"} onClick={() => setAppointmentFilter("cancelled")}>Cancelled</Button>
                </div>
              </div>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : filteredAppointments.length > 0 ? (
                <div className="space-y-3">
                  {filteredAppointments.slice(0, 12).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {appointment.patient_first_name?.[0]}
                            {appointment.patient_last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {appointment.patient_first_name} {appointment.patient_last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{appointment.reason_for_visit || "Appointment"}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {toDateOnly(new Date(appointment.appointment_date)).getTime() > today.getTime()
                              ? "Future"
                              : toDateOnly(new Date(appointment.appointment_date)).getTime() === today.getTime()
                                ? "Today"
                                : "Past"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-medium text-foreground text-sm">
                          {new Date(appointment.appointment_date).toLocaleDateString()}
                        </p>
                        <Badge className={`${appointmentStatusColors[appointment.status as keyof typeof appointmentStatusColors]} border`}>
                          {appointment.status}
                        </Badge>
                        <div className="flex gap-2 justify-end">
                          {appointment.status === "scheduled" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAppointmentStatusUpdate(appointment.id, "completed")}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAppointmentStatusUpdate(appointment.id, "cancelled")}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No appointments found for this filter/search.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-up Queue</CardTitle>
              <CardDescription>Patients requiring immediate continuity of care</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Overdue</p>
                {followUpQueue.overdue.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No overdue patients.</p>
                ) : (
                  <div className="space-y-2">
                    {followUpQueue.overdue.map((patient) => (
                      <div key={`overdue-${patient.id}`} className="border rounded-lg p-2">
                        <p className="text-sm font-medium">{patient.first_name} {patient.last_name}</p>
                        <p className="text-xs text-muted-foreground">Due: {new Date(patient.follow_up_date).toLocaleDateString()}</p>
                        <Button size="sm" variant="link" className="h-auto p-0 mt-1" onClick={() => openPatientDetails(patient.id)}>
                          Open details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Due Today</p>
                {followUpQueue.dueToday.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No follow-ups due today.</p>
                ) : (
                  <div className="space-y-2">
                    {followUpQueue.dueToday.map((patient) => (
                      <div key={`due-${patient.id}`} className="border rounded-lg p-2">
                        <p className="text-sm font-medium">{patient.first_name} {patient.last_name}</p>
                        <p className="text-xs text-muted-foreground">Today follow-up</p>
                        <Button size="sm" variant="link" className="h-auto p-0 mt-1" onClick={() => openPatientDetails(patient.id)}>
                          Open details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Patient Care Tracking</CardTitle>
              <CardDescription>Track treatment status, follow-ups, and discharge readiness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search patients by name, email, or phone"
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={patientStatusFilter === "all" ? "default" : "outline"} onClick={() => setPatientStatusFilter("all")}>All</Button>
                <Button size="sm" variant={patientStatusFilter === "new-case" ? "default" : "outline"} onClick={() => setPatientStatusFilter("new-case")}>New Case</Button>
                <Button size="sm" variant={patientStatusFilter === "under-treatment" ? "default" : "outline"} onClick={() => setPatientStatusFilter("under-treatment")}>Under Treatment</Button>
                <Button size="sm" variant={patientStatusFilter === "follow-up-required" ? "default" : "outline"} onClick={() => setPatientStatusFilter("follow-up-required")}>Follow-up Required</Button>
                <Button size="sm" variant={patientStatusFilter === "improving" ? "default" : "outline"} onClick={() => setPatientStatusFilter("improving")}>Improving</Button>
                <Button size="sm" variant={patientStatusFilter === "chronic-monitoring" ? "default" : "outline"} onClick={() => setPatientStatusFilter("chronic-monitoring")}>Chronic Monitoring</Button>
                <Button size="sm" variant={patientStatusFilter === "treatment-completed" ? "default" : "outline"} onClick={() => setPatientStatusFilter("treatment-completed")}>Completed</Button>
              </div>
              {filteredPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No patients found for this filter/search.</p>
              ) : (
                <div className="space-y-3">
                  {filteredPatients.slice(0, 10).map((patient) => {
                    const status = normalizeTreatmentStatus(patient.treatment_status);
                    return (
                      <div key={patient.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {patient.first_name?.[0]}
                              {patient.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{patient.first_name} {patient.last_name}</p>
                            <p className="text-xs text-muted-foreground">{patient.email || "No email"}</p>
                            {patient.follow_up_date ? (
                              <p className="text-xs text-muted-foreground">Follow-up: {new Date(patient.follow_up_date).toLocaleDateString()}</p>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={`${treatmentStatusColors[status]} border`}>
                            {treatmentStatusLabels[status]}
                          </Badge>
                          <div>
                            <Button size="sm" variant="outline" onClick={() => openPatientDetails(patient.id)}>
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Snapshot</CardTitle>
              <CardDescription>Quick operational metrics for today and upcoming slots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
                <span className="text-muted-foreground">Today's appointments</span>
                <span className="font-semibold">{todayAppointments.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
                <span className="text-muted-foreground">Upcoming appointments</span>
                <span className="font-semibold">{futureAppointments.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
                <span className="text-muted-foreground">Past appointments</span>
                <span className="font-semibold">{pastAppointments.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
                <span className="text-muted-foreground">Specialization</span>
                <span className="font-semibold">{profile?.specialization || "---"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Clinical Updates</CardTitle>
            <CardDescription>
              Unified entries for report comments, prescribed medicines, doses, and tests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={recordSearch}
              onChange={(e) => setRecordSearch(e.target.value)}
              placeholder="Search updates by patient, diagnosis, medicine, or note"
            />
            {filteredRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {records.length === 0 ? "No clinical updates created yet." : "No clinical updates found for this search."}
              </p>
            ) : (
              filteredRecords.slice(0, 8).map((record) => {
                const parsed = parseTreatmentPlan(record.treatment_plan || "");
                return (
                  <div key={record.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm">
                          {record.patient_first_name} {record.patient_last_name}
                        </p>
                        <p className="text-sm text-foreground mt-1">Diagnosis: {record.diagnosis}</p>
                        <p className="text-xs text-muted-foreground mt-1">Comment: {parsed.comment || "N/A"}</p>
                        {parsed.tests ? <p className="text-xs text-muted-foreground mt-1">Tests: {parsed.tests}</p> : null}
                        {record.medications ? <p className="text-xs text-muted-foreground mt-1">Medicines: {record.medications}</p> : null}
                        {Array.isArray(record.attachments) && record.attachments.length > 0 ? (
                          <div className="mt-2 text-xs text-muted-foreground space-y-1">
                            <p className="font-medium">Reports:</p>
                            {record.attachments.map((attachment: AttachmentItem, index: number) => (
                              <a
                                key={`${record.id}-${index}`}
                                href={attachment.dataUrl}
                                download={attachment.name}
                                className="block underline text-primary"
                              >
                                {attachment.name}
                              </a>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openEditClinicalUpdate(record)}>
                        <PenSquare className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Dialog open={isClinicalDialogOpen} onOpenChange={setIsClinicalDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRecordId ? "Modify Clinical Update" : "Add Clinical Update"}</DialogTitle>
              <DialogDescription>
                Single place for doctor comment, medicines with dose/frequency, and test recommendations for {selectedPatientName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Diagnosis</Label>
                <Input
                  value={clinicalForm.diagnosis}
                  onChange={(e) => setClinicalForm((prev) => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="e.g., Viral Fever"
                />
              </div>
              <div>
                <Label>Doctor Comment</Label>
                <Textarea
                  value={clinicalForm.comment}
                  onChange={(e) => setClinicalForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Clinical notes, advice, follow-up instructions"
                />
              </div>
              <div>
                <Label>Prescribed Medicines (include dose/frequency)</Label>
                <Textarea
                  value={clinicalForm.medications}
                  onChange={(e) => setClinicalForm((prev) => ({ ...prev, medications: e.target.value }))}
                  placeholder="Paracetamol 500mg - 1 tab twice daily for 5 days"
                />
              </div>
              <div>
                <Label>Tests / Reports</Label>
                <Textarea
                  value={clinicalForm.tests}
                  onChange={(e) => setClinicalForm((prev) => ({ ...prev, tests: e.target.value }))}
                  placeholder="Urine test, blood test, thyroid profile, etc."
                />
              </div>
              <div>
                <Label>Attach Report Files (PDF, JPEG, PNG, etc.)</Label>
                <Input
                  type="file"
                  multiple
                  accept="application/pdf,image/*,.doc,.docx"
                  onChange={(e) => {
                    handleAttachmentUpload(e.target.files).catch((error) => {
                      toast.error(error.message || "Failed to attach files.");
                    });
                    e.target.value = "";
                  }}
                />
                {clinicalForm.attachments.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {clinicalForm.attachments.map((attachment, index) => (
                      <div key={`${attachment.name}-${index}`} className="flex items-center justify-between text-xs border rounded p-2">
                        <span className="truncate mr-3">{attachment.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <Button className="w-full" onClick={handleSaveClinicalUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingRecordId ? "Save Changes" : "Save Clinical Update"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isTreatmentDialogOpen} onOpenChange={setIsTreatmentDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Update Treatment Status</DialogTitle>
              <DialogDescription>
                Update care lifecycle for {treatmentForm.patientName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.keys(treatmentStatusLabels).map((statusKey) => {
                    const value = statusKey as TreatmentStatus;
                    return (
                      <Button
                        key={value}
                        size="sm"
                        variant={treatmentForm.status === value ? "default" : "outline"}
                        onClick={() => setTreatmentForm((prev) => ({ ...prev, status: value }))}
                        type="button"
                      >
                        {treatmentStatusLabels[value]}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Next Follow-up Date</Label>
                <Input
                  type="date"
                  value={treatmentForm.followUpDate}
                  onChange={(e) => setTreatmentForm((prev) => ({ ...prev, followUpDate: e.target.value }))}
                />
              </div>
              {treatmentForm.status === "treatment-completed" ? (
                <div>
                  <Label>Discharge Summary (required)</Label>
                  <Textarea
                    value={treatmentForm.dischargeSummary}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, dischargeSummary: e.target.value }))}
                    placeholder="Final diagnosis, outcome, medicines stopped/continued, and warning signs"
                  />
                </div>
              ) : null}
              <Button className="w-full" onClick={handleSaveTreatmentStatus} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Treatment Status"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isPatientDetailsOpen} onOpenChange={setIsPatientDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>Patient profile, care status, and timeline across visits</DialogDescription>
            </DialogHeader>
            {selectedPatient ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${treatmentStatusColors[normalizeTreatmentStatus(selectedPatient.treatment_status)]} border`}>
                    {treatmentStatusLabels[normalizeTreatmentStatus(selectedPatient.treatment_status)]}
                  </Badge>
                  {selectedPatient.follow_up_date ? (
                    <Badge variant="outline">Follow-up: {new Date(selectedPatient.follow_up_date).toLocaleDateString()}</Badge>
                  ) : null}
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedPatient.first_name} {selectedPatient.last_name}</p>
                  <p><span className="font-medium">Email:</span> {selectedPatient.email || "N/A"}</p>
                  <p><span className="font-medium">Phone:</span> {selectedPatient.phone || "N/A"}</p>
                  <p><span className="font-medium">Gender:</span> {selectedPatient.gender || "N/A"}</p>
                  <p><span className="font-medium">Blood Type:</span> {selectedPatient.blood_type || "N/A"}</p>
                  <p><span className="font-medium">DOB:</span> {selectedPatient.date_of_birth ? new Date(selectedPatient.date_of_birth).toLocaleDateString() : "N/A"}</p>
                </div>

                <div className="text-sm space-y-2">
                  <p><span className="font-medium">Medical History:</span> {selectedPatient.medical_history || "N/A"}</p>
                  <p><span className="font-medium">Allergies:</span> {selectedPatient.allergies || "N/A"}</p>
                  <p><span className="font-medium">Current Medications:</span> {selectedPatient.current_medications || "N/A"}</p>
                  <p><span className="font-medium">Discharge Summary:</span> {selectedPatient.discharge_summary || "Not discharged yet"}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => openTreatmentDialog(selectedPatient, "follow-up-required")}>Mark Follow-up Required</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => openTreatmentDialog(selectedPatient, "improving")}>Mark Improving</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => openTreatmentDialog(selectedPatient, "under-treatment")}>Reopen / Continue Treatment</Button>
                  <Button type="button" size="sm" onClick={() => openTreatmentDialog(selectedPatient, "treatment-completed")}>Mark Fit / Discharged</Button>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">Care Timeline</p>
                  <div className="space-y-2 max-h-56 overflow-auto">
                    {patientTimeline.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No timeline entries available yet.</p>
                    ) : (
                      patientTimeline.slice(0, 12).map((item) => (
                        <div key={item.id} className="p-2 border rounded text-xs">
                          <p className="font-medium">{item.label}</p>
                          <p className="text-muted-foreground">{item.date.toLocaleDateString()} {item.date.toLocaleTimeString()}</p>
                          <p className="text-muted-foreground uppercase tracking-wide">{item.meta}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    setIsPatientDetailsOpen(false);
                    openNewClinicalUpdate(selectedPatient.id, `${selectedPatient.first_name} ${selectedPatient.last_name}`);
                  }}
                >
                  Write Clinical Update
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Patient details not available.</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SimpleDashboardLayout>
  );
};

export default DoctorDashboard;
