import { Suspense } from "react"
import { preloadQuery } from "convex/nextjs"
import { withAuth } from "@workos-inc/authkit-nextjs"
import { api } from "../../../../../../../convex/_generated/api"
import type { Id } from "../../../../../../../convex/_generated/dataModel"
import { ListPageHeader } from "@/features/lists/components/list-page-header"

interface ListLayoutProps {
  children: React.ReactNode
  params: Promise<{ listId: string }>
}

export default async function ListLayout({ children, params }: ListLayoutProps) {
  const { listId } = await params
  const { accessToken } = await withAuth({ ensureSignedIn: true })

  const preloadedGetListWithSpace = await preloadQuery(
    api.lists.getListWithSpace,
    { listId: listId as Id<"lists"> },
    { token: accessToken }
  )

  return (
    <div className="flex h-full flex-col">
      <ListPageHeader preloadedGetListWithSpace={preloadedGetListWithSpace} />
      {children}
    </div>
  )
}
