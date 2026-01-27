interface Props {
  children: React.ReactNode
}

import { preloadQuery } from "convex/nextjs"
import { withAuth } from "@workos-inc/authkit-nextjs"
import { api } from "../../convex/_generated/api"
import DashboardSidebarClient from "./dashboard-sidebar-client"

export default async function DashboardSidebar({ children }: Props) {
  const { accessToken } = await withAuth({ ensureSignedIn: true })

  const preloadedCurrentThread = await preloadQuery(
    api.brain.getCurrentThread,
    {},
    { token: accessToken }
  )

  return (
    <DashboardSidebarClient preloadedCurrentThread={preloadedCurrentThread}>
      {children}
    </DashboardSidebarClient>
  )
}