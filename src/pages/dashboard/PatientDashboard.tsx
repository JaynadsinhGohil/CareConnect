import { Calendar, FileText, CreditCard, User, Download, Clock } from "lucide-react";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const appointments = [
  { doctor: "Dr. John Smith", specialty: "General Physician", date: "Feb 5, 2024", time: "10:00 AM", status: "upcoming" },
  { doctor: "Dr. Sarah Johnson", specialty: "Dermatologist", date: "Jan 28, 2024", time: "2:30 PM", status: "completed" },
];

const recentReports = [
  { name: "Blood Test Report", date: "Jan 25, 2024", type: "Laboratory" },
  { name: "X-Ray Chest", date: "Jan 20, 2024", type: "Radiology" },
  { name: "ECG Report", date: "Jan 15, 2024", type: "Cardiology" },
];

const prescriptions = [
  { medicine: "Amoxicillin 500mg", dosage: "1 tablet, 3 times daily", duration: "7 days", doctor: "Dr. Smith" },
  { medicine: "Paracetamol 650mg", dosage: "1 tablet, as needed", duration: "5 days", doctor: "Dr. Smith" },
];

const PatientDashboard = () => {
  return (
    <SimpleDashboardLayout role="patient" userName="Sarah Johnson" userId="P-2847">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome, Sarah</h1>
            <p className="text-muted-foreground">Here's your health overview and upcoming appointments.</p>
          </div>
          <Button variant="hero">
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>

        {/* Patient Info Card */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">SJ</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h2 className="text-xl font-semibold text-foreground">Sarah Johnson</h2>
                <p className="text-muted-foreground">Patient ID: P-2847</p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <span className="text-sm text-muted-foreground">Age: 32 years</span>
                  <span className="text-sm text-muted-foreground">Blood Group: A+</span>
                  <span className="text-sm text-muted-foreground">Phone: +1 (555) 123-4567</span>
                </div>
              </div>
              <Button variant="outline">
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Next Appointment"
            value="Feb 5"
            icon={<Calendar className="w-6 h-6" />}
            description="10:00 AM - Dr. Smith"
            variant="primary"
          />
          <StatCard
            title="Total Visits"
            value="12"
            icon={<Clock className="w-6 h-6" />}
            description="Since Jan 2023"
            variant="success"
          />
          <StatCard
            title="Medical Reports"
            value="8"
            icon={<FileText className="w-6 h-6" />}
            description="3 new this month"
            variant="warning"
          />
          <StatCard
            title="Pending Bills"
            value="₹2,500"
            icon={<CreditCard className="w-6 h-6" />}
            description="Due Feb 15"
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
              {appointments.map((apt, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${
                    apt.status === "upcoming" ? "bg-primary/5 border-primary/20" : "bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {apt.doctor.split(" ").slice(1).map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{apt.doctor}</p>
                        <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                      </div>
                    </div>
                    <Badge className={apt.status === "upcoming" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}>
                      {apt.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{apt.date}</span>
                    <span>•</span>
                    <span>{apt.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Medical Reports */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>Your medical documents</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReports.map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{report.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{report.type}</span>
                        <span>•</span>
                        <span>{report.date}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
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
            <div className="grid md:grid-cols-2 gap-4">
              {prescriptions.map((rx, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{rx.medicine}</p>
                      <p className="text-sm text-muted-foreground mt-1">{rx.dosage}</p>
                      <div className="flex items-center gap-3 mt-3 text-sm">
                        <Badge variant="secondary">{rx.duration}</Badge>
                        <span className="text-muted-foreground">by {rx.doctor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleDashboardLayout>
  );
};

export default PatientDashboard;
