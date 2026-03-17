import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Users, Calendar, AlertCircle, Mail, Check, LayoutDashboard, ClipboardList, Settings } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const AdminAddPatient = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [patientCredentials, setPatientCredentials] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  } | null>(null);

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashboard/admin" },
    { label: "Staff Management", icon: <Users className="w-5 h-5" />, path: "/dashboard/admin/staff" },
    { label: "Patients", icon: <UserPlus className="w-5 h-5" />, path: "/dashboard/admin/patients" },
    { label: "Appointments", icon: <ClipboardList className="w-5 h-5" />, path: "/dashboard/admin/appointments" },
    { label: "Settings", icon: <Settings className="w-5 h-5" />, path: "/dashboard/admin/settings" },
  ];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.replace(/\D/g, "").length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 10) {
        setFormData((prev) => ({
          ...prev,
          [name]: digits,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Registering patient:", formData);

      const response = await apiClient.post('/patients/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
      });

      console.log("Registration response:", response);

      if (response.error) {
        console.error("Registration error:", response.error);
        toast.error(response.error);
      } else if (response.data) {
        console.log("Registration successful:", response.data);
        setPatientCredentials({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: (response.data as any).password,
        });
        setRegistrationComplete(true);
        toast.success("Patient registered successfully!");
      }
    } catch (error: any) {
      console.error("Catch error:", error);
      toast.error("Failed to register patient: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
    });
    setErrors({});
    setRegistrationComplete(false);
    setPatientCredentials(null);
  };

  const handleNavigateBack = () => {
    if (registrationComplete) {
      navigate("/dashboard/admin");
    } else {
      navigate(-1);
    }
  };

  if (registrationComplete && patientCredentials) {
    return (
      <DashboardLayout
        navItems={navItems}
        role="administrator"
        userName={user ? `${user.firstName} ${user.lastName}` : "Admin User"}
        onProfileClick={() => navigate('/dashboard/profile-settings')}
        onHelpClick={() => navigate('/dashboard/help-support')}
      >
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigateBack}
              className="h-10 w-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Patient Registered Successfully!</h1>
              <p className="text-muted-foreground">Share these credentials with the patient</p>
            </div>
          </div>

          {/* Success Card */}
          <Card className="border-success/50 bg-success/5">
            <CardContent className="pt-8">
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {patientCredentials.firstName} {patientCredentials.lastName}
                  </h2>
                  <p className="text-muted-foreground">has been successfully registered in the system</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credentials Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Login Credentials
              </CardTitle>
              <CardDescription>Share these credentials with the patient securely</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Email (Login ID)</Label>
                  <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                    <p className="font-mono text-sm font-medium break-all">{patientCredentials.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Temporary Password</Label>
                  <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                    <p className="font-mono text-sm font-medium tracking-wider">{patientCredentials.password}</p>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <Alert className="bg-warning/10 border-warning/20">
                <AlertCircle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning ml-2">
                  <span className="font-medium">Important:</span> This is the only time these credentials will be displayed. Please copy and securely share with the patient. They should change their password after first login.
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Email: ${patientCredentials.email}\nPassword: ${patientCredentials.password}`
                    );
                    toast.success("Credentials copied to clipboard");
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Copy Credentials
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleNavigateBack}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navItems={navItems}
      role="administrator"
      userName={user ? `${user.firstName} ${user.lastName}` : "Admin User"}
      onProfileClick={() => navigate('/dashboard/profile-settings')}
      onHelpClick={() => navigate('/dashboard/help-support')}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNavigateBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Register Patient</h1>
            <p className="text-muted-foreground">Add a new patient to the CareConnect system</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Enter the patient's personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name Row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-medium">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? "border-destructive" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-medium">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? "border-destructive" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-destructive">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-medium">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                  {!errors.phone && formData.phone && (
                    <p className="text-xs text-muted-foreground">
                      {formData.phone.length}/10 digits
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Additional Information
                </CardTitle>
                <CardDescription>Complete patient profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dob" className="font-medium">
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="font-medium">
                    Gender
                  </Label>
                  <Select value={formData.gender} onValueChange={handleSelectChange}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Info Box */}
                <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">Secure Login</p>
                      <p className="text-xs text-primary/80 mt-1">
                        A secure password will be auto-generated and shared with the patient after registration.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Registering Patient...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Register Patient
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    Clear Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminAddPatient;
