import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Users, Zap, CheckCircle2, Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">Digital Healthcare Platform</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Health,{" "}
              <span className="gradient-text">Digitally Connected</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-xl text-balance">
              CareConnect transforms healthcare management with seamless digital solutions. 
              From patient records to appointments, experience healthcare without the paperwork.
            </p>

            {/* Key Benefits */}
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">Secure, HIPAA-compliant records</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">Instant appointment scheduling</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">Real-time patient-doctor collaboration</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/login">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="border-t border-border pt-8 mt-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">10K+</div>
                  <div className="text-sm text-muted-foreground">Patients Served</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">50+</div>
                  <div className="text-sm text-muted-foreground">Medical Staff</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">99%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="hidden lg:block space-y-6">
            {/* Main Feature Card */}
            <div className="glass-card rounded-2xl p-8 border border-primary/20 hover:border-primary/40 transition-colors animate-float shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Enterprise Security</h3>
                  <p className="text-sm text-muted-foreground">Bank-level encryption</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">End-to-end encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">HIPAA compliant standards</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Secure data storage</span>
                </li>
              </ul>
            </div>

            {/* Feature Icons */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">Lightning Fast</h4>
                <p className="text-xs text-muted-foreground">Sub-second load times</p>
              </div>
              <div className="glass-card rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">Role-Based Access</h4>
                <p className="text-xs text-muted-foreground">4 specialized dashboards</p>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="glass-card rounded-xl p-4 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Trusted by Healthcare Providers</p>
                  <p className="text-xs text-muted-foreground">Beta phase - more coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section Below */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
