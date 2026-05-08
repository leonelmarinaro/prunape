import { cn } from "@/lib/utils"

interface AvatarInitialsProps {
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
}

export function AvatarInitials({ name, className, size = "md" }: AvatarInitialsProps) {
  const initials = getInitials(name)

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white select-none",
        "bg-[var(--primary)]",
        sizeClasses[size],
        className
      )}
      aria-label={`Avatar de ${name}`}
    >
      {initials}
    </div>
  )
}
