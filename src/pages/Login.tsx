import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, ArrowRight, Shield, Stethoscope, UserCog, User, Hash } from "lucide-react";

type UserRole = "admin" | "doctor" | "receptionist" | "patient";

const roles = [
  { id: "admin" as UserRole, label: "Admin", icon: Shield, description: "System administration" },
  { id: "doctor" as UserRole, label: "Doctor", icon: Stethoscope, description: "Clinical staff" },
  { id: "receptionist" as UserRole, label: "Reception", icon: UserCog, description: "Front desk" },
  { id: "patient" as UserRole, label: "Patient", icon: User, description: "Patient portal" },
];

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [patientId, setPatientId] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to role-specific dashboard
    navigate(`/dashboard/${selectedRole}`);
  };

  const renderLoginFields = () => {
    switch (selectedRole) {
      case "admin":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12"
                />
              </div>
            </div>
          </>
        );
      
      case "doctor":
      case "receptionist":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="userId">
                {selectedRole === "doctor" ? "Doctor ID" : "Staff ID"}
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="userId"
                  type="text"
                  placeholder={selectedRole === "doctor" ? "Enter Doctor ID (e.g., DR-001)" : "Enter Staff ID (e.g., RCP-001)"}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="pl-11 h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12"
                />
              </div>
            </div>
          </>
        );
      
      case "patient":
        return (
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="patientId"
                type="text"
                placeholder="Enter your Patient ID (e.g., P-2847)"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="pl-11 h-12"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Your Patient ID was provided during registration. Contact reception if you need assistance.
            </p>
          </div>
        );
    }
  };

  const getLoginHint = () => {
    switch (selectedRole) {
      case "admin":
        return "Use your admin email and password";
      case "doctor":
        return "Use your Doctor ID and password";
      case "receptionist":
        return "Use your Staff ID and password";
      case "patient":
        return "Enter your Patient ID to access your records";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(0_0%_100%/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_100%/0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">CareConnect</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
            Welcome back to<br />your health portal
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Access your personalized dashboard with secure, role-based authentication designed for healthcare professionals and patients.
          </p>

          {/* Feature List */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span>HIPAA Compliant Security</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <span>End-to-End Encryption</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-primary-foreground/60 text-sm">
          © 2024 CareConnect. All rights reserved.
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-20 top-1/3 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 bottom-1/4 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CareConnect</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">Sign in</h2>
            <p className="text-muted-foreground mt-2">{getLoginHint()}</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedRole === role.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${selectedRole === role.id ? "text-primary" : "text-muted-foreground"}`} />
                  <div className={`font-medium ${selectedRole === role.id ? "text-primary" : "text-foreground"}`}>
                    {role.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{role.description}</div>
                </button>
              );
            })}
          </div>

          {/* Login Form - Dynamic based on role */}
          <form onSubmit={handleLogin} className="space-y-6">
            {renderLoginFields()}

            <Button variant="hero" size="lg" className="w-full group">
              Sign In as {roles.find(r => r.id === selectedRole)?.label}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <span>Need access? </span>
            <a href="#" className="text-primary hover:underline font-medium">
              Contact administrator
            </a>
          </div>

          <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
