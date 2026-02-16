import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Calendar, CreditCard, Users, Plus, Search, X, AlertCircle } from "lucide-react";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminApi, patientApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const statusColors = {
  confirmed: "bg-success/10 text-success",
  scheduled: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPatientCredentials, setCreatedPatientCredentials] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  } | null>(null);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });



  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
        adminApi.getAppointments(),
        adminApi.getPatients(),
        adminApi.getDoctors(),
      ]);

      // Check for errors and validate data
      if (!appointmentsRes.error && !patientsRes.error && !doctorsRes.error) {
        const appointmentsList = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
        const patientsList = Array.isArray(patientsRes.data) ? patientsRes.data : [];
        const doctorsList = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];
        
        setAppointments(appointmentsList);
        setPatients(patientsList);
        setDoctors(doctorsList);
      } else {
        // Set empty arrays on error
        setAppointments([]);
        setPatients([]);
        setDoctors([]);
        
        toast({
          title: "Error",
          description: "Failed to load data. Please refresh the page.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setAppointments([]);
      setPatients([]);
      setDoctors([]);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNewPatient = async () => {
    // Validation: Check required fields
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.email || !newPatient.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newPatient.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address (e.g., patient@example.com)",
        variant: "destructive",
      });
      return;
    }

    // Validation: Phone number (10 digits)
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
      const result = await patientApi.registerPatient({
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        email: newPatient.email,
        phone: newPatient.phone,
        dateOfBirth: newPatient.dateOfBirth,
        gender: newPatient.gender,
      });

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
        setIsNewPatientOpen(false);
        // Auto-open schedule dialog for easy appointment creation
        setTimeout(() => {
          fetchData();
          // Set the newly registered patient (last one) for scheduling
          const timer = setTimeout(() => setIsScheduleOpen(true), 500);
          return () => clearTimeout(timer);
        }, 100);
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
          description: "Patient checked in successfully!",
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

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'scheduled')
    .slice(0, 6);
  
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const recentPatients = patients.slice(0, 4);

  const filteredPatients = patients.filter(p => 
    p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.substring(0, 8).includes(searchTerm)
  );

  return (
    <SimpleDashboardLayout 
      role="receptionist" 
      userName={user?.firstName || "Receptionist"} 
      userId={user?.id?.substring(0, 8) || "RCP-00"}
      onProfileClick={() => setIsProfileOpen(true)}
      onHelpClick={() => setIsHelpOpen(true)}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reception Dashboard</h1>
            <p className="text-muted-foreground">Manage patients and appointments efficiently.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard/schedule-appointment')}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>

            <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <UserPlus className="w-4 h-4 mr-2" />
                  New Patient
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
                      <Label htmlFor="firstName">First Name*</Label>
                      <Input
                        placeholder="First name"
                        value={newPatient.firstName}
                        onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name*</Label>
                      <Input
                        placeholder="Last name"
                        value={newPatient.lastName}
                        onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email*</Label>
                    <Input
                      type="email"
                      placeholder="patient@example.com"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    />
                    {newPatient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPatient.email) && (
                      <p className="text-xs text-destructive mt-1">Invalid email format</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone* (10 digits)</Label>
                    <Input
                      placeholder="9876543210"
                      value={newPatient.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setNewPatient({ ...newPatient, phone: digits });
                      }}
                      maxLength={10}
                    />
                    {newPatient.phone && newPatient.phone.replace(/\D/g, '').length !== 10 && (
                      <p className="text-xs text-destructive mt-1">Phone must be 10 digits ({newPatient.phone.replace(/\D/g, '').length | 0}/10)</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      type="date"
                      value={newPatient.dateOfBirth}
                      onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
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
                  <Button onClick={handleNewPatient} disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Registering..." : "Register Patient"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Search */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name, ID, or phone number..."
                  className="pl-11 h-12 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="hero" 
                    size="lg"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    Search Patient
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Search Results</DialogTitle>
                    <DialogDescription>
                      Found {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {patient.first_name?.[0]}{patient.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                              <p className="text-sm text-muted-foreground">{patient.phone}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">ID: {patient.id?.substring(0, 12)}</p>
                            <Button size="sm" variant="outline" className="mt-2">View</Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No patients found matching "{searchTerm}"</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value={patients.length.toString()}
            icon={<UserPlus className="w-6 h-6" />}
            description="Registered"
            variant="primary"
          />
          <StatCard
            title="Appointments Today"
            value={upcomingAppointments.length.toString()}
            icon={<Calendar className="w-6 h-6" />}
            description="Upcoming"
            variant="success"
          />
          <StatCard
            title="Completed"
            value={completedAppointments.toString()}
            icon={<CreditCard className="w-6 h-6" />}
            description="This month"
            variant="warning"
          />
          <StatCard
            title="Total Appointments"
            value={totalAppointments.toString()}
            icon={<Users className="w-6 h-6" />}
            description="All time"
            variant="accent"
          />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Next appointments to check-in</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {appointment.patient_first_name?.[0]}{appointment.patient_last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{appointment.patient_first_name} {appointment.patient_last_name}</p>
                          <p className="text-sm text-muted-foreground">Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-foreground text-sm">
                            {new Date(appointment.appointment_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(appointment.appointment_date).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge className={`${statusColors[appointment.status as keyof typeof statusColors]}`}>
                          {appointment.status}
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => handleCheckIn(appointment.id)}
                        >
                          Check-in
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming appointments</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Registrations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Patients</CardTitle>
                <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Plus className="w-4 h-4" />
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
                          <Label htmlFor="firstName">First Name*</Label>
                          <Input
                            placeholder="First name"
                            value={newPatient.firstName}
                            onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name*</Label>
                          <Input
                            placeholder="Last name"
                            value={newPatient.lastName}
                            onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email*</Label>
                        <Input
                          type="email"
                          placeholder="patient@example.com"
                          value={newPatient.email}
                          onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                        />
                        {newPatient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPatient.email) && (
                          <p className="text-xs text-destructive mt-1">Invalid email format</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone* (10 digits)</Label>
                        <Input
                          placeholder="9876543210"
                          value={newPatient.phone}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '');
                            setNewPatient({ ...newPatient, phone: digits });
                          }}
                          maxLength={10}
                        />
                        {newPatient.phone && newPatient.phone.replace(/\D/g, '').length !== 10 && (
                          <p className="text-xs text-destructive mt-1">Phone must be 10 digits ({newPatient.phone.replace(/\D/g, '').length | 0}/10)</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          type="date"
                          value={newPatient.dateOfBirth}
                          onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
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
                      <Button onClick={handleNewPatient} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Registering..." : "Register Patient"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : recentPatients.length > 0 ? (
                <>
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary/50 cursor-pointer transition-colors">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-success/10 text-success text-xs">
                          {patient.first_name?.[0]}{patient.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{patient.first_name} {patient.last_name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{patient.id?.substring(0, 12)}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{patient.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Register New Patient
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
                            <Label htmlFor="firstName">First Name*</Label>
                            <Input
                              placeholder="First name"
                              value={newPatient.firstName}
                              onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name*</Label>
                            <Input
                              placeholder="Last name"
                              value={newPatient.lastName}
                              onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email*</Label>
                          <Input
                            type="email"
                            placeholder="patient@example.com"
                            value={newPatient.email}
                            onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                          />
                          {newPatient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPatient.email) && (
                            <p className="text-xs text-destructive mt-1">Invalid email format</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone* (10 digits)</Label>
                          <Input
                            placeholder="9876543210"
                            value={newPatient.phone}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '');
                              setNewPatient({ ...newPatient, phone: digits });
                            }}
                            maxLength={10}
                          />
                          {newPatient.phone && newPatient.phone.replace(/\D/g, '').length !== 10 && (
                            <p className="text-xs text-destructive mt-1">Phone must be 10 digits ({newPatient.phone.replace(/\D/g, '').length | 0}/10)</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Input
                            type="date"
                            value={newPatient.dateOfBirth}
                            onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="gender">Gender</Label>
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
                        <Button onClick={handleNewPatient} disabled={isSubmitting} className="w-full">
                          {isSubmitting ? "Registering..." : "Register Patient"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <p className="text-muted-foreground">No patients</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Settings Modal */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Profile Settings</DialogTitle>
              <DialogDescription>Manage your account information</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">ID: {user?.id?.substring(0, 12)}</p>
                </div>
              </div>
              
              <div className="space-y-4 bg-secondary/50 p-4 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Account Status</Label>
                  <Badge className="bg-success/10 text-success mt-2">Active</Badge>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <Button variant="outline" className="w-full">Change Password</Button>
                <Button variant="outline" className="w-full">Two-Factor Authentication</Button>
              </div>

              <Button 
                variant="ghost" 
                className="w-full text-destructive"
                onClick={() => setIsProfileOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Help & Support Modal */}
        <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Help & Support</DialogTitle>
              <DialogDescription>Get help with CareConnect</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Frequently Asked Questions</h3>
                
                <details className="border rounded-lg p-3 cursor-pointer hover:bg-secondary/50">
                  <summary className="font-medium">How do I register a new patient?</summary>
                  <p className="text-sm text-muted-foreground mt-2">Click the "New Patient" button and fill in the patient's information including name, email, phone number, and other details.</p>
                </details>

                <details className="border rounded-lg p-3 cursor-pointer hover:bg-secondary/50">
                  <summary className="font-medium">How do I schedule an appointment?</summary>
                  <p className="text-sm text-muted-foreground mt-2">Use the "Schedule" button to create a new appointment. Select the patient, doctor, date, and time, then click schedule.</p>
                </details>

                <details className="border rounded-lg p-3 cursor-pointer hover:bg-secondary/50">
                  <summary className="font-medium">How do I check in a patient?</summary>
                  <p className="text-sm text-muted-foreground mt-2">In the "Upcoming Appointments" section, click the "Check-in" button next to the patient's appointment.</p>
                </details>

                <details className="border rounded-lg p-3 cursor-pointer hover:bg-secondary/50">
                  <summary className="font-medium">How do I search for a patient?</summary>
                  <p className="text-sm text-muted-foreground mt-2">Use the search bar at the top to find patients by name, ID, or phone number. Click "Search Patient" to view results.</p>
                </details>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">Need more help?</span>
                  <p className="text-sm">Contact support@careconnect.com or call 1-800-CARE-NOW</p>
                </AlertDescription>
              </Alert>

              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setIsHelpOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
      </div>
    </SimpleDashboardLayout>
  );
};

export default ReceptionistDashboard;
