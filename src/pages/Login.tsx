import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      toast.error("Please enter email/mobile and password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      
      // Auto-redirect based on user's role detected from backend
      const userRole = result.user.role;
      
      if (userRole === "admin") {
        navigate("/dashboard/admin");
      } else if (userRole === "doctor") {
        navigate("/dashboard/doctor");
      } else if (userRole === "receptionist") {
        navigate("/dashboard/receptionist");
      } else if (userRole === "patient") {
        navigate("/dashboard/patient");
      }
      
      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero p-12 flex-col justify-center items-start relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(0_0%_100%/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_100%/0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 mb-16">
          <Link to="/" className="flex items-center gap-4 group hover:opacity-90 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Heart className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-primary-foreground">CareConnect</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
            Welcome back to<br />your health portal
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Access your personalized dashboard with secure, role-based authentication designed for healthcare professionals and patients.
          </p>
        </div>



        {/* Decorative Elements */}
        <div className="absolute -right-20 top-1/3 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 bottom-1/4 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-3 group hover:opacity-90 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-300/30 to-teal-400/20 backdrop-blur-md flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Heart className="w-6 h-6 text-teal-600" />
              </div>
              <span className="text-2xl font-bold text-foreground">CareConnect</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">Sign in</h2>
            <p className="text-muted-foreground mt-2">Enter your credentials to access your dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Mobile Number</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter your email or mobile"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
