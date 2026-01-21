"use client"

import { useRouter } from "next/navigation"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import {
    ChevronDown,
    Settings,
    UserPlus,
    Plus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

export default function WorkspaceHeader() {
    const trpc = useTRPC()
    const router = useRouter()
    const { organizationId, refreshAuth } = useAuth()

    const { data: organizations, isLoading: isOrgsLoading } = useQuery(
        trpc.organization.listOrganizations.queryOptions()
    )
    const { data: memberCount, isLoading: isCountLoading } = useQuery(
        trpc.organization.countMembers.queryOptions()
    )

    const currentOrg =
        organizations?.find((membership) => membership.organizationId === organizationId) ??
        organizations?.[0]
    const otherOrgs =
        organizations?.filter(
            (membership) => membership.organizationId !== currentOrg?.organizationId
        ) ?? []

    const workspaceName = currentOrg?.organizationName ?? "Workspace"
    const initial = workspaceName.charAt(0).toUpperCase()
    const count = memberCount?.count ?? 0
    const memberLabel = `${count} member${count === 1 ? "" : "s"}`

    const handleSwitchOrg = async (newOrgId: string) => {
        if (!newOrgId || newOrgId === organizationId) return
        await refreshAuth({ organizationId: newOrgId })
        router.replace("/dashboard")
    }

    if (isOrgsLoading || isCountLoading) {
        return (
            <div className="flex items-center gap-2 h-8 px-2.5 bg-muted rounded-md">
                <Skeleton className="size-5 rounded bg-muted-foreground/20" />
                <Skeleton className="h-3.5 w-10 bg-muted-foreground/20" />
                <Skeleton className="size-3 rounded bg-muted-foreground/20" />
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 font-medium"
                >
                    <div className="flex size-5 items-center justify-center rounded-sm bg-emerald-500 text-xs font-bold text-white">
                        {initial}
                    </div>
                    <span className="text-sm truncate max-w-[100px]">{workspaceName}</span>
                    <ChevronDown className="size-3 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="w-72 p-2 flex flex-col gap-2">
                <div className="flex items-center gap-3 px-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500  font-bold text-white">
                        {initial}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-none">{workspaceName}</span>
                        <span className="text-xs text-muted-foreground">
                            {memberLabel}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1">
                    <DropdownMenuItem
                        className="gap-2 px-3 py-2 cursor-pointer flex items-center border rounded-md"
                        onSelect={() => router.push("/dashboard/settings")}
                    >
                        <Settings className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="gap-2 px-3 py-2 cursor-pointer flex items-center border rounded-md"
                    >
                        <UserPlus className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Invite</span>
                    </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className=" bg-muted" />

                {otherOrgs.length > 0 && (
                    <>
                        <div className="space-y-0.5">
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                Switch Workspaces
                            </div>
                            {otherOrgs.map((membership) => (
                                <DropdownMenuItem
                                    key={membership.id}
                                    className="gap-3 px-3 cursor-pointer"
                                    onSelect={() => handleSwitchOrg(membership.organizationId)}
                                >
                                    <div className="flex size-6 items-center justify-center rounded-md bg-emerald-500  font-bold text-white">
                                        {membership.organizationName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm truncate">{membership.organizationName}</span>
                                </DropdownMenuItem>
                            ))}
                        </div>
                        <DropdownMenuSeparator className=" bg-muted" />
                    </>
                )}

                <DropdownMenuItem
                    className="gap-3 px-3 py-2   border rounded-md flex items-center justify-center"
                    onSelect={() => router.push("/onboarding")}
                >
                    <Plus className="size-4" />
                    <span className="text-sm font-medium">Create Workspace</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
