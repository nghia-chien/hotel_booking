import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../ui/utils";

interface AlertMessageProps {
  type: "success" | "error";
  message: string;
  className?: string;
}

export function AlertMessage({ type, message, className }: AlertMessageProps) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div className={cn("animate-in slide-in-from-top-2 duration-300", className)}>
      <div
        className={cn(
          "p-4 rounded-xl border flex items-center gap-3",
          isSuccess
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-red-50 text-red-700 border-red-100"
        )}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
        )}
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

export default AlertMessage;
