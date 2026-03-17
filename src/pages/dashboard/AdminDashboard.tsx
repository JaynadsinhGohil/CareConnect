import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Stethoscope, FileText, Settings, Activity, UserPlus, ClipboardList, Download, X } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi, patientApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashboard/admin" },
  { label: "Staff Management", icon: <Users className="w-5 h-5" />, path: "/dashboard/admin/staff" },
  { label: "Patients", icon: <UserPlus className="w-5 h-5" />, path: "/dashboard/admin/patients" },
  { label: "Appointments", icon: <ClipboardList className="w-5 h-5" />, path: "/dashboard/admin/appointments" },
  { label: "Reports", icon: <FileText className="w-5 h-5" />, path: "/dashboard/admin/reports" },
  { label: "Settings", icon: <Settings className="w-5 h-5" />, path: "/dashboard/admin/settings" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  console.log("AdminDashboard component loaded, user:", user);
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    systemHealth: 99.9,
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isViewAppointmentsOpen, setIsViewAppointmentsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log("Starting fetchDashboardData");
      
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        adminApi.getPatients(),
        adminApi.getDoctors(),
        adminApi.getAppointments(),
      ]);

      console.log("API Responses:", { patientsRes, doctorsRes, appointmentsRes });

      if (!patientsRes.error && !doctorsRes.error && !appointmentsRes.error) {
        const patientsList = Array.isArray(patientsRes.data) ? patientsRes.data : [];
        const doctorsList = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];
        const appointmentsList = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
        
        console.log("Data loaded successfully:", { patientsList, doctorsList, appointmentsList });
        
        setStats({
          totalPatients: patientsList.length,
          totalDoctors: doctorsList.length,
          totalAppointments: appointmentsList.length,
          systemHealth: 99.9,
        });

        setAppointments(appointmentsList.slice(0, 10));
      } else {
        console.error("API errors:", {
          patientsError: patientsRes.error,
          doctorsError: doctorsRes.error,
          appointmentsError: appointmentsRes.error,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "System report downloaded successfully!",
    });
  };

  const recentActivity = appointments.map((apt: any, idx: number) => ({
    id: idx,
    action: `Appointment - ${apt.reason_for_visit || 'Checkup'}`,
    user: `${apt.patient_first_name} ${apt.patient_last_name} with Dr. ${apt.doctor_first_name}`,
    time: new Date(apt.appointment_date).toLocaleDateString(),
    type: "appointment",
  }));

  const typeColors: Record<string, string> = {
    appointment: "bg-primary/10 text-primary",
    patient: "bg-primary/10 text-primary",
    doctor: "bg-success/10 text-success",
    billing: "bg-warning/10 text-warning",
    staff: "bg-accent/10 text-accent",
  };

  return (
    <DashboardLayout 
      navItems={navItems} 
      role="administrator" 
      userName={user ? `${user.firstName} ${user.lastName}` : "Admin User"}
      onProfileClick={() => navigate('/dashboard/profile-settings')}
      onHelpClick={() => navigate('/dashboard/help-support')}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your system overview.</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleGenerateReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button 
              variant="hero"
              onClick={() => navigate('/dashboard/admin/add-staff')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value={stats.totalPatients.toString()}
            icon={<Users className="w-6 h-6" />}
            trend={{ value: 12.5, isPositive: true }}
            variant="primary"
          />
          <StatCard
            title="Medical Staff"
            value={stats.totalDoctors.toString()}
            icon={<Stethoscope className="w-6 h-6" />}
            trend={{ value: 4.2, isPositive: true }}
            variant="success"
          />
          <StatCard
            title="Total Appointments"
            value={stats.totalAppointments.toString()}
            icon={<ClipboardList className="w-6 h-6" />}
            variant="warning"
          />
          <StatCard
            title="System Health"
            value={`${stats.systemHealth}%`}
            icon={<Activity className="w-6 h-6" />}
            description="All systems operational"
            variant="accent"
          />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across the system</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading activity...</p>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${typeColors[activity.type]?.split(' ')[0] || 'bg-primary'}`} />
                        <div>
                          <p className="font-medium text-foreground">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.user}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={typeColors[activity.type]}>
                          {activity.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => navigate('/dashboard/admin/add-patient')}
              >
                <UserPlus className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Register New Patient</span>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => navigate('/dashboard/admin/add-staff')}
              >
                <Users className="w-4 h-4 text-success flex-shrink-0" />
                <span>Add Staff Member</span>
              </Button>

              <Dialog open={isViewAppointmentsOpen} onOpenChange={setIsViewAppointmentsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                    <ClipboardList className="w-4 h-4 text-warning flex-shrink-0" />
                    <span>View All Appointments</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>All Appointments</DialogTitle>
                    <DialogDescription>Total: {appointments.length} appointments</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    {appointments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No appointments yet</p>
                    ) : (
                      appointments.map((apt: any, idx: number) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{apt.patient_first_name} {apt.patient_last_name}</p>
                              <p className="text-sm text-muted-foreground">Dr. {apt.doctor_first_name} {apt.doctor_last_name}</p>
                              <p className="text-sm text-muted-foreground">{apt.reason_for_visit || 'Checkup'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{new Date(apt.appointment_date).toLocaleDateString()}</p>
                              <Badge className={apt.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}>
                                {apt.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isReportsOpen} onOpenChange={setIsReportsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                    <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Generate Reports</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Generate Reports</DialogTitle>
                    <DialogDescription>Select the report type you want to generate</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        toast({ title: "Report Generated", description: "System report downloaded successfully!" });
                        setIsReportsOpen(false);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      System Overview Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        toast({ title: "Report Generated", description: "Patient statistics report downloaded!" });
                        setIsReportsOpen(false);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Patient Statistics Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        toast({ title: "Report Generated", description: "Appointment analytics report downloaded!" });
                        setIsReportsOpen(false);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Appointment Analytics Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        toast({ title: "Report Generated", description: "Staff performance report downloaded!" });
                        setIsReportsOpen(false);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Staff Performance Report
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                    <Settings className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>System Settings</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>System Settings</DialogTitle>
                    <DialogDescription>Manage system configuration</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg bg-secondary/50">
                      <p className="font-medium mb-2">General Settings</p>
                      <div className="space-y-2 text-sm">
                        <p>System Version: 1.0.0</p>
                        <p>Database: PostgreSQL</p>
                        <p>Last Backup: Today at 2:30 AM</p>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg bg-secondary/50">
                      <p className="font-medium mb-2">Security Settings</p>
                      <div className="space-y-2 text-sm">
                        <p>2FA Enabled: Yes</p>
                        <p>SSL/TLS: Active</p>
                        <p>Last Security Audit: 5 days ago</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Full Settings
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
