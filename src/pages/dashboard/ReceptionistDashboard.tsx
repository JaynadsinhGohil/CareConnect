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
  const [isSearchOpen, setIsSearchOpen] = useState(false);



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

            <Button 
              variant="hero"
              onClick={() => navigate('/dashboard/add-patient')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              New Patient
            </Button>
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
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/dashboard/add-patient')}
                >
                  <Plus className="w-4 h-4" />
                </Button>
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/dashboard/add-patient')}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register New Patient
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">No patients</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* End of Content */}
      </div>
    </SimpleDashboardLayout>
  );
};

export default ReceptionistDashboard;
