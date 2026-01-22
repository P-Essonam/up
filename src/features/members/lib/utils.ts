import { MemberRole } from "@/features/members/lib/types"

export const normalizeAdminMemberRole = (
    role?: string | null
  ): MemberRole => {
    if (role === "admin") return "admin"
    return "member"
  }