import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="mb-4 text-4xl" aria-hidden="true">📋</div>
      <p className="text-lg font-semibold text-foreground mb-2">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
