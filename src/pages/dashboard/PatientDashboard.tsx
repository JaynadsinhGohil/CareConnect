import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, FileText, CreditCard, Clock } from "lucide-react";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { patientApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const COMMENT_LABEL = "Doctor Comment:";
const TESTS_LABEL = "Recommended Tests:";

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

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, appointmentsRes, prescriptionsRes, recordsRes] = await Promise.all([
          patientApi.getProfile(),
          patientApi.getAppointments(),
          patientApi.getPrescriptions(),
          patientApi.getMedicalRecords(),
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        if (appointmentsRes.data) setAppointments(appointmentsRes.data);
        if (prescriptionsRes.data) setPrescriptions(prescriptionsRes.data);
        if (recordsRes.data) setRecords(recordsRes.data);

        if (profileRes.error || appointmentsRes.error) {
          console.error('Failed to fetch data');
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const nextAppointment = upcomingAppointments[0];
  const clinicalUpdates = [
    ...records.map((record) => {
      const parsed = parseTreatmentPlan(record.treatment_plan || "");
      return {
        id: `record-${record.id}`,
        title: record.diagnosis || "Clinical Update",
        doctor: `Dr. ${record.doctor_first_name || ""} ${record.doctor_last_name || ""}`.trim(),
        date: record.updated_at || record.created_at,
        comment: parsed.comment || "No additional comments",
        tests: parsed.tests,
        medicines: record.medications || "",
        attachments: Array.isArray(record.attachments) ? record.attachments : [],
      };
    }),
    ...prescriptions.map((rx) => ({
      id: `legacy-rx-${rx.id}`,
      title: `Medicine: ${rx.medication_name}`,
      doctor: `Dr. ${rx.doctor_first_name || ""} ${rx.doctor_last_name || ""}`.trim(),
      date: rx.created_at,
      comment: rx.instructions || `${rx.frequency} for ${rx.duration}`,
      tests: "",
      medicines: `${rx.medication_name} (${rx.dosage}) - ${rx.frequency} for ${rx.duration}`,
    })),
  ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'P';

  return (
    <SimpleDashboardLayout
      role="patient"
      userName={user?.firstName || "Patient"}
      userId={user?.id?.substring(0, 8) || "P-00"}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.firstName}</h1>
            <p className="text-muted-foreground">Here's your health overview and upcoming appointments.</p>
          </div>
          <Button variant="hero" onClick={() => navigate('/dashboard/book-appointment')}>
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>

        {/* Patient Info Card */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h2 className="text-xl font-semibold text-foreground">{user?.firstName} {user?.lastName}</h2>
                <p className="text-muted-foreground">Patient ID: {user?.id?.substring(0, 12)}</p>
                <div className="flex flex-wrap gap-4 pt-2">
                  {profile?.gender && <span className="text-sm text-muted-foreground">Gender: {profile.gender}</span>}
                  {profile?.blood_type && <span className="text-sm text-muted-foreground">Blood Group: {profile.blood_type}</span>}
                  {user?.phone && <span className="text-sm text-muted-foreground">Phone: {user.phone}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Next Appointment"
            value={nextAppointment ? new Date(nextAppointment.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "No"}
            icon={<Calendar className="w-6 h-6" />}
            description={nextAppointment ? `Dr. ${nextAppointment.doctor_first_name}` : "No upcoming"}
            variant="primary"
          />
          <StatCard
            title="Total Visits"
            value={completedAppointments.length.toString()}
            icon={<Clock className="w-6 h-6" />}
            description="Completed visits"
            variant="success"
          />
          <StatCard
            title="Medical Records"
            value={records.length.toString()}
            icon={<FileText className="w-6 h-6" />}
            description="Your reports"
            variant="warning"
          />
          <StatCard
            title="Active Meds"
            value={prescriptions.length.toString()}
            icon={<CreditCard className="w-6 h-6" />}
            description="Current medications"
            variant="accent"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Appointments</CardTitle>
                  <CardDescription>Upcoming and recent visits</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : appointments.length > 0 ? (
                appointments.slice(0, 6).map((apt) => (
                  <div
                    key={apt.id}
                    className={`p-4 rounded-xl border ${apt.status === "scheduled" ? "bg-primary/5 border-primary/20" : "bg-card"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {apt.doctor_first_name?.[0]}{apt.doctor_last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">Dr. {apt.doctor_first_name} {apt.doctor_last_name}</p>
                          <p className="text-sm text-muted-foreground">{apt.specialization}</p>
                        </div>
                      </div>
                      <Badge className={apt.status === "scheduled" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}>
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(apt.appointment_date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No appointments yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Doctor Clinical Updates</CardTitle>
                  <CardDescription>Unified view for comments, medicines, doses, and tests</CardDescription>
                </div>
                <Button variant="outline" size="sm">Latest</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : clinicalUpdates.length > 0 ? (
                clinicalUpdates.slice(0, 4).map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-xl border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Comment: {item.comment}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No doctor updates yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Doctor Updates</CardTitle>
            <CardDescription>
              Single stream of everything added by doctor: comment, medicine with dose, and tests like urine test, blood test, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : clinicalUpdates.length > 0 ? (
              clinicalUpdates.map((item: any) => (
                <div key={item.id} className="p-4 rounded-xl border bg-card">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.doctor || "Doctor"}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-3 text-sm text-foreground">
                    <p><span className="font-medium">Comment:</span> {item.comment}</p>
                    {item.medicines ? <p className="text-muted-foreground mt-1"><span className="font-medium">Medicines:</span> {item.medicines}</p> : null}
                    {item.tests ? <p className="text-muted-foreground mt-1"><span className="font-medium">Tests:</span> {item.tests}</p> : null}
                    {item.attachments?.length ? (
                      <div className="mt-2 space-y-1">
                        <p className="font-medium text-muted-foreground">Reports:</p>
                        {item.attachments.map((attachment: AttachmentItem, idx: number) => (
                          <a
                            key={`${item.id}-${idx}`}
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
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No doctor updates available yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Prescriptions</CardTitle>
            <CardDescription>All active prescriptions provided by your doctors</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : prescriptions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 rounded-xl border bg-card">
                    <p className="font-medium text-foreground">{rx.medication_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{rx.dosage} - {rx.frequency}</p>
                    <p className="text-sm text-muted-foreground mt-1">Duration: {rx.duration}</p>
                    <p className="text-sm text-muted-foreground mt-1">Instructions: {rx.instructions || "N/A"}</p>
                    <p className="text-xs text-muted-foreground mt-2">Prescribed by Dr. {rx.doctor_first_name} {rx.doctor_last_name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No active prescriptions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </SimpleDashboardLayout>
  );
};

export default PatientDashboard;
