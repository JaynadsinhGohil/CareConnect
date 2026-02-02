import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-sidebar text-sidebar-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Care<span className="text-sidebar-primary">Connect</span>
              </span>
            </Link>
            <p className="text-sidebar-foreground/70 text-sm leading-relaxed">
              Transforming healthcare management with innovative digital solutions for medical centers worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sidebar-foreground">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <a href="#services" className="text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors text-sm">
                  Services
                </a>
              </li>
              <li>
                <a href="#about" className="text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <Link to="/login" className="text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors text-sm">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-sidebar-foreground">Services</h4>
            <ul className="space-y-3">
              <li className="text-sidebar-foreground/70 text-sm">Patient Management</li>
              <li className="text-sidebar-foreground/70 text-sm">Appointment Scheduling</li>
              <li className="text-sidebar-foreground/70 text-sm">Electronic Records</li>
              <li className="text-sidebar-foreground/70 text-sm">Billing System</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sidebar-foreground">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sidebar-foreground/70 text-sm">
                <Mail className="w-4 h-4 text-sidebar-primary" />
                contact@careconnect.com
              </li>
              <li className="flex items-center gap-3 text-sidebar-foreground/70 text-sm">
                <Phone className="w-4 h-4 text-sidebar-primary" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-start gap-3 text-sidebar-foreground/70 text-sm">
                <MapPin className="w-4 h-4 text-sidebar-primary shrink-0 mt-0.5" />
                123 Healthcare Ave, Medical District, NY 10001
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-sidebar-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sidebar-foreground/60 text-sm">
            © 2024 CareConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-primary transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-primary transition-colors text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
