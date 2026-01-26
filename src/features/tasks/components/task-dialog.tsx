"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar as CalendarIcon, ChevronDown, Flag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, getMemberDisplayName, getMemberInitials } from "@/lib/utils"
import { useTRPC } from "@/trpc/client"
import { useMutation as useConvexMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"
import { defaultStatuses, priorityOptions } from "../lib/constants"
import type { Task, TaskPriority, TaskFormValues } from "../lib/types"
import { taskFormSchema } from "../lib/types"
import { getDefaultValues } from "../lib/utils"

type TaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  listId: Id<"lists">
  mode?: "create" | "edit"
  task?: Task
  taskId?: Id<"tasks">
  defaultStatus?: TaskFormValues["status"]
}

export function TaskDialog({ 
  open, 
  onOpenChange, 
  listId, 
  mode = "create",
  task,
  taskId,
  defaultStatus
}: TaskDialogProps) {
  const trpc = useTRPC()
  const createTask = useConvexMutation(api.tasks.create)
  const updateTask = useConvexMutation(api.tasks.update)
  const [assigneesOpen, setAssigneesOpen] = useState(false)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [dueDateOpen, setDueDateOpen] = useState(false)

  const isEdit = mode === "edit"

  const { data, isLoading: isLoadingMembers } = useQuery(
    trpc.organization.listMembers.queryOptions({ limit: 100 })
  )
  const members = data?.items ?? []

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: getDefaultValues(task, defaultStatus),
  })

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(isEdit ? task : undefined, isEdit ? undefined : defaultStatus))
    }
  }, [open, isEdit, task, form, defaultStatus])

  const assigneeIds = form.watch("assigneeIds") ?? []
  const assignedMembers = useMemo(
    () => members.filter((m) => assigneeIds.includes(m.id)),
    [members, assigneeIds]
  )

  const toggleAssignee = (memberId: string) => {
    const currentIds = form.getValues("assigneeIds") ?? []
    const newIds = currentIds.includes(memberId)
      ? currentIds.filter((id) => id !== memberId)
      : [...currentIds, memberId]
    form.setValue("assigneeIds", newIds)
  }

  const handleSubmit = async (data: TaskFormValues) => {
    if (isEdit && !taskId) {
      return
    }

    try {
      const taskData = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        status: data.status,
        priority: data.priority || undefined,
        assigneeIds: data.assigneeIds?.length ? data.assigneeIds : [],
        startDate: data.startDate?.getTime() || undefined,
        dueDate: data.dueDate?.getTime() || undefined,
      }

      if (isEdit) {
        await updateTask({ id: taskId!, ...taskData })
      } else {
        await createTask({ listId, ...taskData })
      }

      onOpenChange(false)
    } catch (error) {
      console.error(`Failed to ${isEdit ? "update" : "create"} task:`, error)
    }
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the task details below."
              : "Add a new task to this list. Fill in the details below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Title <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Enter task title"
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Add a description..."
                  rows={3}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="w-full" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                <Select
                  value={field.value || "todo"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id={field.name} className="w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="priority"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="w-full" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => field.onChange(value as TaskPriority)}
                  >
                    <SelectTrigger id={field.name} className="w-full" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Flag className={cn("size-4", option.flagColor)} />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="assigneeIds"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="w-full" data-invalid={fieldState.invalid}>
                  <FieldLabel>Assignees</FieldLabel>
                  <Popover open={assigneesOpen} onOpenChange={setAssigneesOpen}>
                    <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      type="button"
                      aria-invalid={fieldState.invalid}
                    >
                      {assignedMembers.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {assignedMembers.slice(0, 3).map((member) => (
                              <Avatar key={member.id} className="size-6 border-2 border-background">
                                <AvatarImage src={member.profilePictureUrl || undefined} />
                                <AvatarFallback className="text-xs">
                                  {getMemberInitials(member)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          {assignedMembers.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{assignedMembers.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Select assignees</span>
                      )}
                      <ChevronDown className="size-4 opacity-50" />
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-2">
                      {isLoadingMembers ? (
                        <div className="p-4 text-sm text-muted-foreground">Loading members...</div>
                      ) : members.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground">No members available</div>
                      ) : (
                        <div className="space-y-1">
                          {members.map((member) => {
                            const isSelected = assigneeIds.includes(member.id)
                            return (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() => toggleAssignee(member.id)}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                                  isSelected && "bg-accent"
                                )}
                              >
                                <Avatar className="size-6">
                                  <AvatarImage src={member.profilePictureUrl || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {getMemberInitials(member)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="flex-1 text-left">{getMemberDisplayName(member)}</span>
                                {isSelected && (
                                  <span className="text-xs text-muted-foreground">✓</span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    </PopoverContent>
                  </Popover>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="startDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <DatePicker
                  field={field}
                  fieldState={fieldState}
                  open={startDateOpen}
                  onOpenChange={setStartDateOpen}
                  label="Start Date"
                  placeholder="Pick start date"
                />
              )}
            />

            <Controller
              name="dueDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <DatePicker
                  field={field}
                  fieldState={fieldState}
                  open={dueDateOpen}
                  onOpenChange={setDueDateOpen}
                  label="Due Date"
                  placeholder="Pick due date"
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit ? "Saving…" : "Creating…"
                : isEdit ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}




type DatePickerProps = {
  field: {
    value: Date | null | undefined
    onChange: (date: Date | null) => void
  }
  fieldState: {
    invalid: boolean
    error?: { message?: string }
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  label: string
  placeholder: string
}

const DatePicker = ({
  field,
  fieldState,
  open,
  onOpenChange,
  label,
  placeholder,
}: DatePickerProps) => (
  <Field className="w-full" data-invalid={fieldState.invalid}>
    <FieldLabel>{label}</FieldLabel>
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !field.value && "text-muted-foreground"
          )}
          type="button"
          aria-invalid={fieldState.invalid}
        >
          <CalendarIcon className="mr-2 size-4" />
          {field.value ? field.value.toLocaleDateString() : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={field.value ?? undefined}
          onSelect={(date) => {
            field.onChange(date ?? null)
            if (date) onOpenChange(false)
          }}
          defaultMonth={field.value ?? undefined}
        />
      </PopoverContent>
    </Popover>
    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
  </Field>
)