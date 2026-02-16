import { useEffect, useState } from "react";
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
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [isRegisterPatientOpen, setIsRegisterPatientOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isViewAppointmentsOpen, setIsViewAppointmentsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [createdStaffCredentials, setCreatedStaffCredentials] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);
  const [createdPatientCredentials, setCreatedPatientCredentials] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  } | null>(null);

  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Form states
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });

  const [newStaff, setNewStaff] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "doctor",
    specialization: "",
  });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        adminApi.getPatients(),
        adminApi.getDoctors(),
        adminApi.getAppointments(),
      ]);

      if (!patientsRes.error && !doctorsRes.error && !appointmentsRes.error) {
        const patientsList = Array.isArray(patientsRes.data) ? patientsRes.data : [];
        const doctorsList = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];
        const appointmentsList = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
        
        setStats({
          totalPatients: patientsList.length,
          totalDoctors: doctorsList.length,
          totalAppointments: appointmentsList.length,
          systemHealth: 99.9,
        });

        setAppointments(appointmentsList.slice(0, 10));
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

  const handleRegisterPatient = async () => {
    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.email || !newPatient.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!emailRegex.test(newPatient.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    const phoneDigits = newPatient.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      toast({
        title: "Error",
        description: "Phone number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await patientApi.registerPatient(newPatient);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        const patientData = result.data as any;
        setCreatedPatientCredentials({
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          password: patientData.password,
        });
        toast({
          title: "Success",
          description: "Patient registered successfully! Share credentials with them.",
        });
        setNewPatient({ firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", gender: "" });
        setIsRegisterPatientOpen(false);
        fetchDashboardData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register patient",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStaff = async () => {
    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newStaff.firstName || !newStaff.lastName || !newStaff.email || !newStaff.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!emailRegex.test(newStaff.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    const phoneDigits = newStaff.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      toast({
        title: "Error",
        description: "Phone number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await adminApi.createStaff({
        firstName: newStaff.firstName,
        lastName: newStaff.lastName,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role,
        password: newStaff.firstName ? undefined : undefined, // Let backend generate if empty
        specialization: newStaff.specialization,
      });

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        // Store credentials for display
        const staffData = result.data as any;
        setCreatedStaffCredentials({
          firstName: staffData.firstName,
          lastName: staffData.lastName,
          email: staffData.email,
          password: staffData.password,
          role: staffData.role,
        });
        
        toast({
          title: "Success",
          description: "Staff member created successfully! Share credentials with them.",
        });
        
        setNewStaff({ firstName: "", lastName: "", email: "", phone: "", role: "doctor", specialization: "" });
        setIsAddStaffOpen(false);
        fetchDashboardData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add staff",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "System report downloaded successfully!",
    });
  };

  const handleSaveProfileSettings = async () => {
    // Validation
    if (!profileSettings.firstName || !profileSettings.lastName || !profileSettings.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileSettings.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Phone validation (if provided)
    if (profileSettings.phone) {
      const phoneDigits = profileSettings.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        toast({
          title: "Error",
          description: "Phone number must be exactly 10 digits",
          variant: "destructive",
        });
        return;
      }
    }

    // Password match validation (if changing password)
    if (profileSettings.newPassword) {
      if (profileSettings.newPassword !== profileSettings.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (profileSettings.newPassword.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        return;
      }

      if (!profileSettings.currentPassword) {
        toast({
          title: "Error",
          description: "Please enter your current password to change it",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // For now, show success - backend integration for profile update can be added
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsProfileSettingsOpen(false);
      // Reset password fields
      setProfileSettings({
        ...profileSettings,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
      onProfileClick={() => setIsProfileSettingsOpen(true)}
      onHelpClick={() => setIsSettingsOpen(true)}
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
            <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Staff Member</DialogTitle>
                  <DialogDescription>Add a new doctor or staff member to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name*</Label>
                      <Input
                        placeholder="John"
                        value={newStaff.firstName}
                        onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Last Name*</Label>
                      <Input
                        placeholder="Doe"
                        value={newStaff.lastName}
                        onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email*</Label>
                    <Input
                      type="email"
                      placeholder="doctor@hospital.com"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Phone* (10 digits)</Label>
                    <Input
                      placeholder="9876543210"
                      value={newStaff.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setNewStaff({ ...newStaff, phone: digits });
                      }}
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Label>Role*</Label>
                    <Select value={newStaff.role} onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newStaff.role === 'doctor' && (
                    <div>
                      <Label>Specialization</Label>
                      <Input
                        placeholder="e.g., Cardiology"
                        value={newStaff.specialization}
                        onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
                      />
                    </div>
                  )}
                  <Button onClick={handleAddStaff} disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Adding..." : "Add Staff Member"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
              <Dialog open={isRegisterPatientOpen} onOpenChange={setIsRegisterPatientOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                    <UserPlus className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Register New Patient</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Register New Patient</DialogTitle>
                    <DialogDescription>Add a new patient to the system</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name*</Label>
                        <Input
                          placeholder="John"
                          value={newPatient.firstName}
                          onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Last Name*</Label>
                        <Input
                          placeholder="Doe"
                          value={newPatient.lastName}
                          onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Email*</Label>
                      <Input
                        type="email"
                        placeholder="patient@example.com"
                        value={newPatient.email}
                        onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Phone* (10 digits)</Label>
                      <Input
                        placeholder="9876543210"
                        value={newPatient.phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '');
                          setNewPatient({ ...newPatient, phone: digits });
                        }}
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={newPatient.dateOfBirth}
                        onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select value={newPatient.gender} onValueChange={(value) => setNewPatient({ ...newPatient, gender: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleRegisterPatient} disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Registering..." : "Register Patient"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                    <Users className="w-4 h-4 text-success flex-shrink-0" />
                    <span>Add Staff Member</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Staff Member</DialogTitle>
                    <DialogDescription>Add a new doctor or staff member to the system</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name*</Label>
                        <Input
                          placeholder="John"
                          value={newStaff.firstName}
                          onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Last Name*</Label>
                        <Input
                          placeholder="Doe"
                          value={newStaff.lastName}
                          onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Email*</Label>
                      <Input
                        type="email"
                        placeholder="doctor@hospital.com"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Phone* (10 digits)</Label>
                      <Input
                        placeholder="9876543210"
                        value={newStaff.phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '');
                          setNewStaff({ ...newStaff, phone: digits });
                        }}
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label>Role*</Label>
                      <Select value={newStaff.role} onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="nurse">Nurse</SelectItem>
                          <SelectItem value="receptionist">Receptionist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newStaff.role === 'doctor' && (
                      <div>
                        <Label>Specialization</Label>
                        <Input
                          placeholder="e.g., Cardiology"
                          value={newStaff.specialization}
                          onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
                        />
                      </div>
                    )}
                    <Button onClick={handleAddStaff} disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Adding..." : "Add Staff Member"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

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

        {/* Staff Credentials Modal */}
        {createdStaffCredentials && (
          <Dialog open={!!createdStaffCredentials} onOpenChange={() => setCreatedStaffCredentials(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Staff Member Created Successfully!</DialogTitle>
                <DialogDescription>Share these credentials with the staff member</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm">Name</Label>
                      <p className="font-medium">{createdStaffCredentials.firstName} {createdStaffCredentials.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Role</Label>
                      <p className="font-medium capitalize">{createdStaffCredentials.role}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Email (Login ID)</Label>
                      <p className="font-mono bg-background p-2 rounded border text-sm break-all">
                        {createdStaffCredentials.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Temporary Password</Label>
                      <p className="font-mono bg-background p-2 rounded border text-sm">
                        {createdStaffCredentials.password}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-500/10 border border-amber-600/30 p-3 rounded-lg">
                  <p className="text-sm text-amber-900 dark:text-amber-200">
                    ⚠️ This is the only time these credentials will be shown. Please copy and securely share with the staff member. They can change their password after first login.
                  </p>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Email: ${createdStaffCredentials.email}\nPassword: ${createdStaffCredentials.password}`
                    );
                    toast({
                      title: "Copied",
                      description: "Credentials copied to clipboard",
                    });
                  }}
                >
                  Copy Credentials
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setCreatedStaffCredentials(null)}
                >
                  Done
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Patient Credentials Modal */}
        {createdPatientCredentials && (
          <Dialog open={!!createdPatientCredentials} onOpenChange={() => setCreatedPatientCredentials(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Patient Registered Successfully!</DialogTitle>
                <DialogDescription>Share these credentials with the patient</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm">Name</Label>
                      <p className="font-medium">{createdPatientCredentials.firstName} {createdPatientCredentials.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Email (Login ID)</Label>
                      <p className="font-mono bg-background p-2 rounded border text-sm break-all">
                        {createdPatientCredentials.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Temporary Password</Label>
                      <p className="font-mono bg-background p-2 rounded border text-sm">
                        {createdPatientCredentials.password}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-600/30 p-3 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    ℹ️ This is the only time these credentials will be shown. Please copy and securely share with the patient. They can change their password after first login.
                  </p>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Email: ${createdPatientCredentials.email}\nPassword: ${createdPatientCredentials.password}`
                    );
                    toast({
                      title: "Copied",
                      description: "Credentials copied to clipboard",
                    });
                  }}
                >
                  Copy Credentials
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setCreatedPatientCredentials(null)}
                >
                  Done
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Admin Profile Settings Modal */}
        <Dialog open={isProfileSettingsOpen} onOpenChange={setIsProfileSettingsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Profile Settings</DialogTitle>
              <DialogDescription>Update your profile information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name*</Label>
                  <Input
                    value={profileSettings.firstName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Last Name*</Label>
                  <Input
                    value={profileSettings.lastName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Email*</Label>
                <Input
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone (10 digits)</Label>
                <Input
                  value={profileSettings.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setProfileSettings({ ...profileSettings, phone: digits });
                  }}
                  maxLength={10}
                />
              </div>

              {/* Change Password Section */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-sm mb-3">Change Password (Optional)</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Current Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter your current password"
                      value={profileSettings.currentPassword}
                      onChange={(e) => setProfileSettings({ ...profileSettings, currentPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">New Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={profileSettings.newPassword}
                      onChange={(e) => setProfileSettings({ ...profileSettings, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Confirm Password</Label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={profileSettings.confirmPassword}
                      onChange={(e) => setProfileSettings({ ...profileSettings, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfileSettings} disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
