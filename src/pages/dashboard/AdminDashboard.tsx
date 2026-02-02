import { LayoutDashboard, Users, Stethoscope, FileText, Settings, Activity, UserPlus, ClipboardList } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashboard/admin" },
  { label: "Staff Management", icon: <Users className="w-5 h-5" />, path: "/dashboard/admin/staff" },
  { label: "Patients", icon: <UserPlus className="w-5 h-5" />, path: "/dashboard/admin/patients" },
  { label: "Appointments", icon: <ClipboardList className="w-5 h-5" />, path: "/dashboard/admin/appointments" },
  { label: "Reports", icon: <FileText className="w-5 h-5" />, path: "/dashboard/admin/reports" },
  { label: "Settings", icon: <Settings className="w-5 h-5" />, path: "/dashboard/admin/settings" },
];

const recentActivity = [
  { action: "New patient registered", user: "Sarah Johnson", time: "2 mins ago", type: "patient" },
  { action: "Dr. Smith updated schedule", user: "Dr. John Smith", time: "15 mins ago", type: "doctor" },
  { action: "Invoice generated", user: "Reception", time: "1 hour ago", type: "billing" },
  { action: "New staff member added", user: "Admin", time: "2 hours ago", type: "staff" },
  { action: "Patient discharged", user: "Nurse Williams", time: "3 hours ago", type: "patient" },
];

const typeColors = {
  patient: "bg-primary/10 text-primary",
  doctor: "bg-success/10 text-success",
  billing: "bg-warning/10 text-warning",
  staff: "bg-accent/10 text-accent",
};

const AdminDashboard = () => {
  return (
    <DashboardLayout navItems={navItems} role="administrator" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your system overview.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Download Report</Button>
            <Button variant="hero">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value="2,847"
            icon={<Users className="w-6 h-6" />}
            trend={{ value: 12.5, isPositive: true }}
            variant="primary"
          />
          <StatCard
            title="Medical Staff"
            value="48"
            icon={<Stethoscope className="w-6 h-6" />}
            trend={{ value: 4.2, isPositive: true }}
            variant="success"
          />
          <StatCard
            title="Today's Appointments"
            value="156"
            icon={<ClipboardList className="w-6 h-6" />}
            description="23 pending"
            variant="warning"
          />
          <StatCard
            title="System Health"
            value="99.9%"
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
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${typeColors[activity.type as keyof typeof typeColors].replace('bg-', 'bg-').split(' ')[0].replace('/10', '')}`} />
                      <div>
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.user}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={typeColors[activity.type as keyof typeof typeColors]}>
                        {activity.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3">
                <UserPlus className="w-4 h-4 text-primary" />
                Register New Patient
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Users className="w-4 h-4 text-success" />
                Add Staff Member
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <ClipboardList className="w-4 h-4 text-warning" />
                View All Appointments
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <FileText className="w-4 h-4 text-accent" />
                Generate Reports
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Settings className="w-4 h-4 text-muted-foreground" />
                System Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
