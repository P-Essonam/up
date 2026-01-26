import { preloadQuery } from "convex/nextjs"
import { withAuth } from "@workos-inc/authkit-nextjs"
import { api } from "../../../../../convex/_generated/api"
import WorkspacePage from "@/features/spaces/components/workspace-page"

export default async function Page() {
  const { accessToken } = await withAuth({ ensureSignedIn: true })

  const preloadedSpaces = await preloadQuery(
    api.spaces.listWithLists,
    {},
    { token: accessToken }
  )

  return <WorkspacePage preloadedSpaces={preloadedSpaces} />
}
