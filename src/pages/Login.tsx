import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, ArrowRight, Shield, Stethoscope, UserCog, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type UserRole = "admin" | "doctor" | "receptionist" | "patient";

const roles = [
  { id: "admin" as UserRole, label: "Admin", icon: Shield, description: "System administration" },
  { id: "doctor" as UserRole, label: "Doctor", icon: Stethoscope, description: "Clinical staff" },
  { id: "receptionist" as UserRole, label: "Reception", icon: UserCog, description: "Front desk" },
  { id: "patient" as UserRole, label: "Patient", icon: User, description: "Patient portal" },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    // Clear fields when switching roles
    setEmail("");
    setPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      
      // Role-based validation: check if logged-in user's role matches selected role
      if (result.user.role !== selectedRole) {
        toast.error(`Invalid credentials for ${selectedRole}. Please check your email and password.`);
        setIsLoading(false);
        return;
      }
      
      if (result.user.role === "admin") {
        navigate("/dashboard/admin");
      } else if (result.user.role === "doctor") {
        navigate("/dashboard/doctor");
      } else if (result.user.role === "receptionist") {
        navigate("/dashboard/receptionist");
      } else if (result.user.role === "patient") {
        navigate("/dashboard/patient");
      }
      
      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getLoginHint = () => {
    switch (selectedRole) {
      case "admin":
        return "Use your admin email and password";
      case "doctor":
        return "Use your doctor email and password";
      case "receptionist":
        return "Use your staff email and password";
      case "patient":
        return "Use your email and password";
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

          {/* Demo Credentials */}
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
                  type="button"
                  onClick={() => handleRoleChange(role.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedRole === role.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${selectedRole === role.id ? "text-primary" : "text-muted-foreground"}`} />
                  <div className={`font-medium text-sm ${selectedRole === role.id ? "text-primary" : "text-foreground"}`}>
                    {role.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{role.description}</div>
                </button>
              );
            })}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12"
                  disabled={isLoading}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              variant="hero" 
              size="lg" 
              className="w-full group" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>Loading...</>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <span>Don't have an account? </span>
            <Link to="/" className="text-primary font-medium hover:underline">Contact admin</Link>
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
