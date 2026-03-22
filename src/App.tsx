import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import ReceptionistDashboard from "./pages/dashboard/ReceptionistDashboard";
import ReceptionistScheduleAppointment from "./pages/dashboard/ReceptionistScheduleAppointment";
import AddNewPatient from "./pages/dashboard/AddNewPatient";
import AdminAddPatient from "./pages/dashboard/AdminAddPatient";
import AdminAddStaff from "./pages/dashboard/AdminAddStaff";
import AdminStaffManagement from "./pages/dashboard/AdminStaffManagement";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import ProfileSettings from "./pages/dashboard/ProfileSettings";
import HelpSupport from "./pages/dashboard/HelpSupport";
import BookAppointment from "./pages/dashboard/BookAppointment";
import EditPatientProfile from "./pages/dashboard/EditPatientProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor"
              element={
                <ProtectedRoute requiredRoles={["doctor"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/receptionist"
              element={
                <ProtectedRoute requiredRoles={["receptionist"]}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/schedule-appointment"
              element={
                <ProtectedRoute requiredRoles={["receptionist"]}>
                  <ReceptionistScheduleAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/add-patient"
              element={
                <ProtectedRoute requiredRoles={["receptionist"]}>
                  <AddNewPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/add-patient"
              element={
                <ProtectedRoute requiredRoles={["admin", "receptionist"]}>
                  <AdminAddPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/staff"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminStaffManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/add-staff"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminAddStaff />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patient"
              element={
                <ProtectedRoute requiredRoles={["patient"]}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile-settings"
              element={
                <ProtectedRoute requiredRoles={["patient", "doctor", "admin", "receptionist"]}>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/help-support"
              element={
                <ProtectedRoute requiredRoles={["patient", "doctor", "admin", "receptionist"]}>
                  <HelpSupport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/book-appointment"
              element={
                <ProtectedRoute requiredRoles={["patient"]}>
                  <BookAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/edit-profile"
              element={
                <ProtectedRoute requiredRoles={["patient"]}>
                  <EditPatientProfile />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
