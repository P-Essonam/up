import { redirect } from "next/navigation"
import { initialSpaces } from "@/features/spaces/lib/data"

export default function SpacesPage() {
  const firstSpace = initialSpaces[0]
  const firstList = firstSpace?.lists?.[0]

  if (firstSpace && firstList) {
    redirect(`/dashboard/spaces/${firstSpace.id}/lists/${firstList.id}`)
  }

  return (
    <div className="p-4 text-sm text-muted-foreground">
      No lists available yet. Create a space to get started.
    </div>
  )
}
