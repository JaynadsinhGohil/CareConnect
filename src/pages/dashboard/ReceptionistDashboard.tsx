import { UserPlus, Calendar, CreditCard, Users, Plus, Search } from "lucide-react";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const upcomingAppointments = [
  { patient: "John Miller", doctor: "Dr. Smith", time: "09:00 AM", status: "confirmed" },
  { patient: "Emma Wilson", doctor: "Dr. Johnson", time: "09:30 AM", status: "waiting" },
  { patient: "David Lee", doctor: "Dr. Smith", time: "10:00 AM", status: "confirmed" },
  { patient: "Sophie Brown", doctor: "Dr. Williams", time: "10:30 AM", status: "confirmed" },
];

const recentPatients = [
  { name: "Alice Cooper", id: "P-2847", registered: "Today, 8:45 AM" },
  { name: "Bob Martinez", id: "P-2846", registered: "Today, 8:30 AM" },
  { name: "Carol White", id: "P-2845", registered: "Yesterday" },
];

const statusColors = {
  confirmed: "bg-success/10 text-success",
  waiting: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
};

const ReceptionistDashboard = () => {
  return (
    <SimpleDashboardLayout role="receptionist" userName="Jane Doe" userId="RCP-001">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reception Dashboard</h1>
            <p className="text-muted-foreground">Manage patients and appointments efficiently.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button variant="hero">
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
                />
              </div>
              <Button variant="hero" size="lg">
                Search Patient
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Check-ins"
            value="24"
            icon={<UserPlus className="w-6 h-6" />}
            description="8 pending"
            variant="primary"
          />
          <StatCard
            title="Appointments Today"
            value="42"
            icon={<Calendar className="w-6 h-6" />}
            description="3 cancelled"
            variant="success"
          />
          <StatCard
            title="Pending Bills"
            value="12"
            icon={<CreditCard className="w-6 h-6" />}
            description="₹45,200 total"
            variant="warning"
          />
          <StatCard
            title="Waiting Room"
            value="5"
            icon={<Users className="w-6 h-6" />}
            description="Avg. wait: 12 mins"
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
              <div className="space-y-3">
                {upcomingAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {appointment.patient.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{appointment.patient}</p>
                        <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-foreground">{appointment.time}</p>
                        <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <Button size="sm">Check-in</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Registrations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Registrations</CardTitle>
                <Button variant="ghost" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPatients.map((patient, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary/50 cursor-pointer transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-success/10 text-success text-xs">
                      {patient.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{patient.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{patient.id}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{patient.registered}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Register New Patient
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleDashboardLayout>
  );
};

export default ReceptionistDashboard;
