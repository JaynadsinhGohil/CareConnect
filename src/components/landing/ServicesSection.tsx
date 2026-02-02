import { Calendar, FileText, Users, CreditCard, ClipboardList, Activity } from "lucide-react";

const services = [
  {
    icon: Users,
    title: "Patient Management",
    description: "Digital patient registration and comprehensive profile management with complete medical history tracking.",
    color: "primary",
  },
  {
    icon: Calendar,
    title: "Appointment Scheduling",
    description: "Intuitive calendar-based booking system for seamless doctor appointments and visit management.",
    color: "accent",
  },
  {
    icon: FileText,
    title: "Electronic Medical Records",
    description: "Secure digital storage for patient records, prescriptions, and medical notes accessible anytime.",
    color: "success",
  },
  {
    icon: CreditCard,
    title: "Billing & Invoicing",
    description: "Streamlined billing process with digital invoices, payment tracking, and financial reports.",
    color: "warning",
  },
  {
    icon: ClipboardList,
    title: "Staff Management",
    description: "Comprehensive tools for managing doctors, nurses, and administrative staff efficiently.",
    color: "primary",
  },
  {
    icon: Activity,
    title: "Analytics & Reports",
    description: "Real-time dashboards and detailed reports for data-driven healthcare decisions.",
    color: "accent",
  },
];

const colorClasses = {
  primary: "bg-primary/10 text-primary border-primary/20",
  accent: "bg-accent/10 text-accent border-accent/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
};

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">Our Services</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Complete Healthcare Management
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to run a modern medical center, from patient care to administrative tasks.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl border ${colorClasses[service.color as keyof typeof colorClasses]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
