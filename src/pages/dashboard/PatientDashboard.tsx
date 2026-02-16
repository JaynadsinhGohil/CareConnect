import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, FileText, CreditCard, User, Download, Clock } from "lucide-react";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { patientApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'P';

  return (
    <SimpleDashboardLayout 
      role="patient" 
      userName={user?.firstName || "Patient"} 
      userId={user?.id?.substring(0, 8) || "P-00"}
      onProfileClick={() => navigate('/dashboard/profile-settings')}
      onHelpClick={() => navigate('/dashboard/help-support')}
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

        {/* Content Grid */}
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
                appointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={`p-4 rounded-xl border ${
                      apt.status === "scheduled" ? "bg-primary/5 border-primary/20" : "bg-card"
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

          {/* Medical Records */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Medical Records</CardTitle>
                  <CardDescription>Your medical documents</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : records.length > 0 ? (
                records.slice(0, 3).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 rounded-xl border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{record.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No medical records yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Current Prescriptions</CardTitle>
            <CardDescription>Active medications from your doctors</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : prescriptions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-4 rounded-xl border bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{rx.medication_name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{rx.dosage} - {rx.frequency}</p>
                        <div className="flex items-center gap-3 mt-3 text-sm">
                          <Badge variant="secondary">{rx.duration}</Badge>
                          <span className="text-muted-foreground">by Dr. {rx.doctor_first_name}</span>
                        </div>
                      </div>
                    </div>
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
