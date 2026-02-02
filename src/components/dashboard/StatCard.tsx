import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  variant?: "default" | "primary" | "success" | "warning" | "accent";
}

const variantClasses = {
  default: "bg-card",
  primary: "bg-primary/5 border-primary/20",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  accent: "bg-accent/5 border-accent/20",
};

const iconVariantClasses = {
  default: "bg-primary/10 text-primary",
  primary: "bg-primary/20 text-primary",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  accent: "bg-accent/20 text-accent",
};

const StatCard = ({
  title,
  value,
  icon,
  trend,
  description,
  variant = "default",
}: StatCardProps) => {
  return (
    <div className={`rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-success" : "text-destructive"
                }`}
              >
                {trend.value}%
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconVariantClasses[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
