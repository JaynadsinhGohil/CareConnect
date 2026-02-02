import { Calendar, FileText, Users, ClipboardList, Clock, User } from "lucide-react";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const todayAppointments = [
  { name: "Sarah Johnson", time: "09:00 AM", type: "Check-up", status: "completed" },
  { name: "Michael Brown", time: "10:30 AM", type: "Follow-up", status: "completed" },
  { name: "Emily Davis", time: "11:45 AM", type: "Consultation", status: "in-progress" },
  { name: "James Wilson", time: "02:00 PM", type: "Check-up", status: "upcoming" },
  { name: "Lisa Anderson", time: "03:30 PM", type: "Emergency", status: "upcoming" },
  { name: "Robert Taylor", time: "04:45 PM", type: "Follow-up", status: "upcoming" },
];

const statusColors = {
  completed: "bg-success/10 text-success border-success/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  upcoming: "bg-secondary text-muted-foreground border-border",
};

const DoctorDashboard = () => {
  return (
    <SimpleDashboardLayout role="doctor" userName="Dr. John Smith" userId="DR-001">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Good Morning, Dr. Smith</h1>
            <p className="text-muted-foreground">You have 6 appointments scheduled today.</p>
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
            value="6"
            icon={<Users className="w-6 h-6" />}
            description="2 completed, 1 ongoing"
            variant="primary"
          />
          <StatCard
            title="Weekly Patients"
            value="34"
            icon={<Calendar className="w-6 h-6" />}
            trend={{ value: 8.3, isPositive: true }}
            variant="success"
          />
          <StatCard
            title="Pending Reports"
            value="5"
            icon={<FileText className="w-6 h-6" />}
            description="Due this week"
            variant="warning"
          />
          <StatCard
            title="Average Time"
            value="18m"
            icon={<Clock className="w-6 h-6" />}
            description="Per consultation"
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
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Your appointments for today</CardDescription>
                </div>
                <Button variant="ghost" size="sm">View Full Calendar</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-sm ${
                      appointment.status === "in-progress" ? "bg-warning/5 border-warning/20" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {appointment.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{appointment.name}</p>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-foreground">{appointment.time}</p>
                        <Badge className={`${statusColors[appointment.status as keyof typeof statusColors]} border`}>
                          {appointment.status === "in-progress" ? "In Progress" : 
                           appointment.status === "completed" ? "Completed" : "Upcoming"}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Patient Access */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Quick access to patient records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayAppointments.slice(0, 4).map((patient, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {patient.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">{patient.type}</p>
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
