import type React from "react"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return <div className="container mx-auto px-4 grid items-start gap-8 pb-8 pt-6 md:py-8">{children}</div>
}

