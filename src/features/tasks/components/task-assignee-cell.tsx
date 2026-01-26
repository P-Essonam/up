"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, getMemberDisplayName, getMemberInitials } from "@/lib/utils"
import { useTRPC } from "@/trpc/client"
import type { Task } from "@/features/tasks/lib/types"

type TaskAssigneeCellProps = {
  task: Task
  onUpdate: (assigneeIds: string[]) => void
}

export function TaskAssigneeCell({ task, onUpdate }: TaskAssigneeCellProps) {
  const [open, setOpen] = React.useState(false)
  const trpc = useTRPC()
  const { data, isLoading: isLoadingMembers } = useQuery(
    trpc.organization.listMembers.queryOptions({ limit: 100 })
  )

  const members = data?.items ?? []
  const assigneeIds = task.assigneeIds

  const assignedMembers = React.useMemo(() => {
    return members.filter((m) => assigneeIds.includes(m.id))
  }, [members, assigneeIds])

  const availableMembers = React.useMemo(() => {
    return members.filter((m) => !assigneeIds.includes(m.id))
  }, [members, assigneeIds])

  const handleAdd = (memberId: string) => {
    if (!assigneeIds.includes(memberId)) {
      onUpdate([...assigneeIds, memberId])
    }
    setOpen(false)
  }

  const handleRemove = (memberId: string) => {
    onUpdate(assigneeIds.filter((id) => id !== memberId))
  }


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full cursor-pointer justify-start gap-2 px-0! py-1 text-xs text-muted-foreground hover:bg-transparent items-center",
            assignedMembers.length > 0 && "text-foreground"
          )}
        >
          {isLoadingMembers ? (
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : assignedMembers.length > 0 ? (
            <div className="flex items-center gap-1">
              {assignedMembers.slice(0, 2).map((member) => (
                <Avatar key={member.id} className="size-5">
                  <AvatarImage
                    src={member.profilePictureUrl || undefined}
                  />
                  <AvatarFallback>
                    {getMemberInitials(member)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {assignedMembers.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{assignedMembers.length - 2}
                </span>
              )}
            </div>
          ) : (

            <UserPlus className="size-4" />

          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder="Search or enter email..." />
          <CommandList>
            <CommandEmpty>No members found.</CommandEmpty>
            {assignedMembers.length > 0 && (
              <CommandGroup heading="Assignees">
                {assignedMembers.map((member) => {
                  const displayName = getMemberDisplayName(member)

                  return (
                    <CommandItem
                      key={member.id}
                      onSelect={() => { }}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="size-6">
                        <AvatarImage
                          src={member.profilePictureUrl || undefined}
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {getMemberInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium">
                          {displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {member.email}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(member.id)
                        }}
                      >
                        Remove
                      </Button>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
            {availableMembers.length === 0 ? null : (
              <CommandGroup heading="People">
                {isLoadingMembers ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <>
                    {availableMembers.map((member) => {
                        const memberDisplayName = getMemberDisplayName(member)

                        return (
                          <CommandItem
                            key={member.id}
                            onSelect={() => handleAdd(member.id)}
                            className="flex items-center gap-2"
                          >
                            <Avatar className="size-6">
                              <AvatarImage
                                src={member.profilePictureUrl || undefined}
                              />
                              <AvatarFallback className="text-xs font-semibold">
                                {getMemberInitials(member)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {memberDisplayName}
                              </span>
                              {member.firstName && (
                                <span className="text-xs text-muted-foreground">
                                  {member.email}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        )
                    })}
                  </>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
