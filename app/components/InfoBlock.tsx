type InfoBlockProps = {
  label: string;
  value?: string | number | null;
  variant?: "default" | "metadata" | "rootCause" | "resolution" | "downtime";
  className?: string;
};

const variants = {
  default: "border-slate-200 bg-white",
  metadata: "border-slate-200 bg-slate-50",
  rootCause: "border-red-200 bg-red-50",
  resolution: "border-green-200 bg-green-50",
  downtime: "border-amber-200 bg-amber-50",
};

const labelColors = {
  default: "text-slate-500",
  metadata: "text-slate-500",
  rootCause: "text-red-700",
  resolution: "text-green-700",
  downtime: "text-amber-700",
};

export default function InfoBlock({
  label,
  value,
  variant = "default",
  className = "",
}: InfoBlockProps) {
  return (
    <div className={`rounded border p-4 ${variants[variant]} ${className}`}>
      <p
        className={`mb-1 text-xs font-semibold uppercase tracking-wide ${labelColors[variant]}`}
      >
        {label}
      </p>
      <p className="text-sm leading-6 text-slate-900">
        {value || "Not recorded"}
      </p>
    </div>
  );
}
