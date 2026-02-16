import { useEffect, useState } from "react";
import { Calendar, FileText, Users, ClipboardList, Clock, User } from "lucide-react";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { doctorApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const statusColors = {
  completed: "bg-success/10 text-success border-success/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  scheduled: "bg-secondary text-muted-foreground border-border",
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, appointmentsRes] = await Promise.all([
          doctorApi.getProfile(),
          doctorApi.getAppointments(),
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        if (appointmentsRes.data) setAppointments(appointmentsRes.data);

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

  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const todayAppointments = appointments.slice(0, 6);

  return (
    <SimpleDashboardLayout role="doctor" userName={`Dr. ${user?.lastName}`} userId={user?.id?.substring(0, 8) || "DR-00"}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Good Morning, Dr. {user?.lastName}</h1>
            <p className="text-muted-foreground">You have {scheduledCount} appointments scheduled.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">View All Patients</Button>
            <Button variant="hero">
              <FileText className="w-4 h-4 mr-2" />
              New Record
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Patients"
            value={scheduledCount.toString()}
            icon={<Users className="w-6 h-6" />}
            description={`${completedCount} completed this month`}
            variant="primary"
          />
          <StatCard
            title="Total Appointments"
            value={appointments.length.toString()}
            icon={<Calendar className="w-6 h-6" />}
            description="All time"
            variant="success"
          />
          <StatCard
            title="Completed"
            value={completedCount.toString()}
            icon={<FileText className="w-6 h-6" />}
            description="This month"
            variant="warning"
          />
          <StatCard
            title="Specialization"
            value={profile?.specialization || "---"}
            icon={<Clock className="w-6 h-6" />}
            description={`Exp: ${profile?.years_experience || 0} years`}
            variant="accent"
          />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Appointments</CardTitle>
                  <CardDescription>Recent and upcoming appointments</CardDescription>
                </div>
                <Button variant="ghost" size="sm">View Full Calendar</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : appointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-sm ${
                        appointment.status === "in-progress" ? "bg-warning/5 border-warning/20" : "bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {appointment.patient_first_name?.[0]}{appointment.patient_last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{appointment.patient_first_name} {appointment.patient_last_name}</p>
                          <p className="text-sm text-muted-foreground">{appointment.reason_for_visit || 'Appointment'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-foreground text-sm">
                            {new Date(appointment.appointment_date).toLocaleDateString()}
                          </p>
                          <Badge className={`${statusColors[appointment.status as keyof typeof statusColors]} border`}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No appointments scheduled</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Patient Access */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Quick access to patient records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments.slice(0, 4).map((patient) => (
                <div key={patient.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {patient.patient_first_name?.[0]}{patient.patient_last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{patient.patient_first_name} {patient.patient_last_name}</p>
                    <p className="text-xs text-muted-foreground">{patient.status}</p>
                  </div>
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Patients
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleDashboardLayout>
  );
};

export default DoctorDashboard;
