import React from "react"
import { cn } from "@/lib/utils"

type MembershipStatus = "active" | "inactive" | "pending"

const statusStyles: Record<
  MembershipStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "text-emerald-600",
  },
  pending: {
    label: "Pending",
    className: "text-amber-600",
  },
  inactive: {
    label: "Inactive",
    className: "text-muted-foreground",
  },
}

export default function MemberStatusBadge({
  status,
}: {
  status: MembershipStatus
}) {
  const style = statusStyles[status]

  return (
    <div className={cn("flex items-center gap-2 text-sm", style.className)}>
      <span className="size-2 rounded-full bg-current" />
      <span className="font-medium">{style.label}</span>
    </div>
  )
}
