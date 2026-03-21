import { useState } from "react";
import { ArrowLeft, Mail, Phone, MessageSquare, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SimpleDashboardLayout from "@/components/dashboard/SimpleDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

const HelpSupport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "general",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post("/user/support-request", {
        subject: formData.subject,
        message: formData.message,
        category: formData.category,
      });

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Support request submitted successfully. We'll get back to you soon!");
        setFormData({
          subject: "",
          message: "",
          category: "general",
        });
      }
    } catch (error: any) {
      toast.error("Failed to submit support request");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const faqItems = [
    {
      question: "How do I add a new staff member?",
      answer:
        "Go to Staff Management > Add Staff button. Fill in the staff details including name, email, role (Doctor/Receptionist), and specialization if applicable. The new staff member will receive credentials via email.",
    },
    {
      question: "How do I manage user accounts and permissions?",
      answer:
        "In Staff Management, you can view all staff members, update their status (Active/Inactive/Suspended), and manage their roles. You can also remove staff members from the system.",
    },
    {
      question: "How can I view system analytics and reports?",
      answer:
        "Access the Admin Dashboard to view key metrics like total patients, medical staff count, total appointments, and system health status. Use the admin panel for detailed reports and data exports.",
    },
    {
      question: "How do I manage patient records?",
      answer:
        "Navigate to Patients section in the admin panel to view all patient records, manage their information, and track their medical history and appointments.",
    },
    {
      question: "How do I monitor appointments?",
      answer:
        "Use the Appointments section to view all scheduled appointments, their status, and manage appointment-related operations across all doctors and patients.",
    },
    {
      question: "Where can I find system settings and configuration?",
      answer:
        "System Settings are available in the admin panel where you can configure system parameters, manage security settings, and update general system configuration.",
    },
  ];

  return (
    <SimpleDashboardLayout role={user?.role || "patient"} userName={user?.firstName || "User"} userId={user?.id?.substring(0, 8)}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
            <p className="text-muted-foreground">
              {user?.role === "admin" 
                ? "Admin documentation and system management help"
                : "Get help with your account and find answers to common questions"}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              <p className="text-xs text-muted-foreground mt-2">Available 9AM - 6PM EST</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground">support@careconnect.com</p>
              <p className="text-xs text-muted-foreground mt-2">Response within 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat with our team</p>
              <p className="text-xs text-muted-foreground mt-2">Available 8AM - 8PM EST</p>
            </CardContent>
          </Card>
        </div>

        {/* Support Request Form - Only for non-admin users */}
        {user?.role !== "admin" && (
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Request</CardTitle>
              <CardDescription>Tell us how we can help you</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="appointment">Appointment Help</option>
                    <option value="billing">Billing & Payment</option>
                    <option value="medical">Medical Concern</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Briefly describe your issue or question"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Provide detailed information about your issue or question"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                    {isLoading ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setFormData({ subject: "", message: "", category: "general" })}>
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {user?.role === "admin" ? "Admin FAQs & Documentation" : "Frequently Asked Questions"}
            </CardTitle>
            <CardDescription>Find quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="pb-6 border-b last:border-b-0 last:pb-0">
                <h3 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  {item.question}
                </h3>
                <p className="text-sm text-muted-foreground ml-7">{item.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Hours of Operation */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Hours of Operation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-foreground">Regular Hours</p>
                <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM EST</p>
                <p className="text-muted-foreground">Sunday: Closed</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Emergency Support</p>
                <p className="text-muted-foreground">24/7 for medical emergencies</p>
                <p className="text-muted-foreground">Call: +1 (555) 999-8888</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleDashboardLayout>
  );
};

export default HelpSupport;
