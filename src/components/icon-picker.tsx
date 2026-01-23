"use client"

import * as React from "react"
import { Search, icons, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const COLOR_OPTIONS = [
  { label: "Violet", className: "bg-violet-500" },
  { label: "Indigo", className: "bg-indigo-500" },
  { label: "Blue", className: "bg-blue-500" },
  { label: "Sky", className: "bg-sky-500" },
  { label: "Teal", className: "bg-teal-500" },
  { label: "Emerald", className: "bg-emerald-500" },
  { label: "Green", className: "bg-green-500" },
  { label: "Amber", className: "bg-amber-500" },
  { label: "Orange", className: "bg-orange-500" },
  { label: "Red", className: "bg-red-500" },
  { label: "Rose", className: "bg-rose-500" },
  { label: "Pink", className: "bg-pink-500" },
  { label: "Fuchsia", className: "bg-fuchsia-500" },
  { label: "Stone", className: "bg-stone-500" },
]

const ALL_ICONS = Object.keys(icons).sort()
const PAGE_SIZE = 48

export type IconPickerWithColorProps = {
  icon: string
  color: string
  onIconChange: (icon: string) => void
  onColorChange: (color: string) => void
  onReset: () => void
}

export function getIcon(name: string): LucideIcon {
  return icons[name as keyof typeof icons] ?? icons.Layers
}

export function IconPickerWithColor({
  icon,
  color,
  onIconChange,
  onColorChange,
  onReset,
}: IconPickerWithColorProps) {
  const [query, setQuery] = React.useState("")
  const [isColorOpen, setIsColorOpen] = React.useState(false)
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE)
  const colorMenuRef = React.useRef<HTMLDivElement | null>(null)
  const colorButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const loaderRef = React.useRef<HTMLDivElement | null>(null)

  const filteredIcons = React.useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return ALL_ICONS
    return ALL_ICONS.filter((name) => name.toLowerCase().includes(search))
  }, [query])

  const displayedIcons = filteredIcons.slice(0, visibleCount)
  const hasMore = visibleCount < filteredIcons.length

  // Reset visible count when query changes
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query])

  // Infinite scroll with intersection observer
  React.useEffect(() => {
    const loader = loaderRef.current
    if (!loader || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loader)
    return () => observer.disconnect()
  }, [hasMore])

  React.useEffect(() => {
    if (!isColorOpen) return
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (colorMenuRef.current?.contains(target)) return
      if (colorButtonRef.current?.contains(target)) return
      setIsColorOpen(false)
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [isColorOpen])

  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-sm font-semibold text-foreground">Icon</span>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Reset
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 pl-8"
            aria-label="Search icons"
          />
        </div>
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="h-9 w-9"
            ref={colorButtonRef}
            onClick={() => setIsColorOpen((prev) => !prev)}
            aria-label="Choose color"
          >
            <span className={cn("size-4 rounded-full", color)} />
          </Button>
          {isColorOpen && (
            <div
              ref={colorMenuRef}
              className="absolute right-0 top-full z-10 mt-2 w-64 rounded-lg border bg-background p-3 shadow-lg"
            >
              <div className="grid grid-cols-7 gap-2">
                {COLOR_OPTIONS.map((option) => {
                  const isSelected = option.className === color
                  return (
                    <button
                      key={option.label}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        onColorChange(option.className)
                        setIsColorOpen(false)
                      }}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full border border-transparent transition",
                        isSelected && "border-foreground/20 ring-2 ring-foreground/15"
                      )}
                      title={option.label}
                    >
                      <span className={cn("size-5 rounded-full", option.className)} />
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="mt-3 h-56 rounded-md border border-border/60">
        <div className="grid grid-cols-8 gap-1.5 p-2">
          {displayedIcons.map((iconName) => {
            const Icon = getIcon(iconName)
            const isSelected = iconName === icon
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => onIconChange(iconName)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md border border-transparent text-muted-foreground transition hover:bg-muted",
                  isSelected && "bg-muted"
                )}
                title={iconName}
                aria-pressed={isSelected}
              >
                <Icon className="size-4" />
              </button>
            )
          })}
        </div>
        {hasMore && <div ref={loaderRef} className="h-4" />}
      </ScrollArea>
    </div>
  )
}
