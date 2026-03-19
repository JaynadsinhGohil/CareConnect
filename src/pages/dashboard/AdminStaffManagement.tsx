import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, UserPlus, ClipboardList, Settings, Search, Trash2, Eye } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "doctor" | "receptionist";
  status: "active" | "inactive" | "suspended";
  specialization?: string | null;
  createdAt: string;
};

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashboard/admin" },
  { label: "Staff Management", icon: <Users className="w-5 h-5" />, path: "/dashboard/admin/staff" },
  { label: "Patients", icon: <UserPlus className="w-5 h-5" />, path: "/dashboard/admin/patients" },
  { label: "Appointments", icon: <ClipboardList className="w-5 h-5" />, path: "/dashboard/admin/appointments" },
  { label: "Settings", icon: <Settings className="w-5 h-5" />, path: "/dashboard/admin/settings" },
];

const statusBadgeClass: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
  suspended: "bg-destructive/10 text-destructive",
};

const AdminStaffManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getStaff();

      if (response.error) {
        throw new Error(response.error);
      }

      setStaffList(Array.isArray(response.data) ? (response.data as StaffMember[]) : []);
    } catch (error: any) {
      toast({
        title: "Unable to load staff",
        description: error.message || "Something went wrong while fetching staff data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return staffList.filter((staff) => {
      const matchesSearch =
        !keyword ||
        `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(keyword) ||
        staff.email.toLowerCase().includes(keyword) ||
        (staff.phone || "").toLowerCase().includes(keyword);

      const matchesRole = roleFilter === "all" || staff.role === roleFilter;
      const matchesStatus = statusFilter === "all" || staff.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffList, searchTerm, roleFilter, statusFilter]);

  const activeCount = staffList.filter((staff) => staff.status === "active").length;
  const doctorCount = staffList.filter((staff) => staff.role === "doctor").length;
  const receptionistCount = staffList.filter((staff) => staff.role === "receptionist").length;

  const updateStatus = async (staff: StaffMember, status: "active" | "inactive" | "suspended") => {
    try {
      setIsActionLoading(staff.id);
      const response = await adminApi.updateStaffStatus(staff.id, status);

      if (response.error) {
        throw new Error(response.error);
      }

      setStaffList((prev) => prev.map((item) => (item.id === staff.id ? { ...item, status } : item)));
      toast({
        title: "Status updated",
        description: `${staff.firstName} ${staff.lastName} is now ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: "Unable to update status",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(null);
    }
  };

  const removeStaff = async (staff: StaffMember) => {
    const confirmed = window.confirm(`Remove ${staff.firstName} ${staff.lastName} from staff? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      setIsActionLoading(staff.id);
      const response = await adminApi.removeStaff(staff.id);

      if (response.error) {
        throw new Error(response.error);
      }

      setStaffList((prev) => prev.filter((item) => item.id !== staff.id));
      toast({
        title: "Staff removed",
        description: `${staff.firstName} ${staff.lastName} has been removed.`,
      });
    } catch (error: any) {
      toast({
        title: "Unable to remove staff",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <DashboardLayout
      navItems={navItems}
      role="administrator"
      userName={user ? `${user.firstName} ${user.lastName}` : "Admin User"}
      onProfileClick={() => navigate("/dashboard/profile-settings")}
      onHelpClick={() => navigate("/dashboard/help-support")}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
            <p className="text-muted-foreground">Manage hospital staff accounts, permissions, and lifecycle.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="hero" onClick={() => navigate("/dashboard/admin/add-staff")}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Staff</p>
              <p className="text-2xl font-bold">{staffList.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Active Staff</p>
              <p className="text-2xl font-bold text-success">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Doctors</p>
              <p className="text-2xl font-bold">{doctorCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Receptionists</p>
              <p className="text-2xl font-bold">{receptionistCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
            <CardDescription>Search, filter, view details, suspend, activate, or remove staff members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, phone"
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading staff data...</div>
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No staff members found for current filters.</div>
            ) : (
              <div className="space-y-3">
                {filteredStaff.map((staff) => {
                  const isCurrentUser = user?.id === staff.id;
                  const actionDisabled = isActionLoading === staff.id;

                  return (
                    <div key={staff.id} className="p-4 border rounded-lg">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground">{staff.firstName} {staff.lastName}</p>
                            <Badge variant="secondary" className="capitalize">{staff.role}</Badge>
                            <Badge variant="secondary" className={statusBadgeClass[staff.status] || "bg-muted text-foreground"}>
                              {staff.status}
                            </Badge>
                            {isCurrentUser && <Badge variant="outline">You</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{staff.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {staff.phone || "No phone"}
                            {staff.role === "doctor" && staff.specialization ? ` • ${staff.specialization}` : ""}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Staff Details</DialogTitle>
                                <DialogDescription>Full information for {staff.firstName} {staff.lastName}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 text-sm">
                                <p><span className="font-medium">Name:</span> {staff.firstName} {staff.lastName}</p>
                                <p><span className="font-medium">Role:</span> <span className="capitalize">{staff.role}</span></p>
                                <p><span className="font-medium">Status:</span> <span className="capitalize">{staff.status}</span></p>
                                <p><span className="font-medium">Email:</span> {staff.email}</p>
                                <p><span className="font-medium">Phone:</span> {staff.phone || "N/A"}</p>
                                {staff.role === "doctor" && (
                                  <p><span className="font-medium">Specialization:</span> {staff.specialization || "General Medicine"}</p>
                                )}
                                <p><span className="font-medium">Created:</span> {new Date(staff.createdAt).toLocaleString()}</p>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {staff.status === "active" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionDisabled || isCurrentUser}
                              onClick={() => updateStatus(staff, "suspended")}
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionDisabled}
                              onClick={() => updateStatus(staff, "active")}
                            >
                              Activate
                            </Button>
                          )}

                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={actionDisabled || isCurrentUser}
                            onClick={() => removeStaff(staff)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminStaffManagement;
