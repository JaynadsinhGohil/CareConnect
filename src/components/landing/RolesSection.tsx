import { Shield, Stethoscope, UserCog, User } from "lucide-react";

const roles = [
  {
    icon: Shield,
    title: "Administrator",
    description: "Full system control with staff management, system logs, and complete oversight of all operations.",
    features: ["Staff Management", "System Reports", "User Access Control", "Analytics Dashboard"],
  },
  {
    icon: Stethoscope,
    title: "Doctor / Nurse",
    description: "Clinical tools for patient care, medical records, and treatment management.",
    features: ["Patient Schedule", "EMR Access", "Medical Reports", "Prescription Management"],
  },
  {
    icon: UserCog,
    title: "Receptionist",
    description: "Front-desk operations including appointments, billing, and patient registration.",
    features: ["Patient Registration", "Appointment Booking", "Billing & Invoicing", "Visitor Management"],
  },
  {
    icon: User,
    title: "Patient",
    description: "Personal health portal with access to records, appointments, and billing history.",
    features: ["View Medical History", "Book Appointments", "Access Reports", "Billing Details"],
  },
];

const RolesSection = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <span className="text-sm font-medium text-accent">Role-Based Access</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tailored Dashboards for Every Role
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each user type gets a personalized experience designed for their specific needs and responsibilities.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <div
                key={index}
                className="group relative glass-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center shadow-glow shrink-0">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {role.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {role.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
