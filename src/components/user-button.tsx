"use client"

import * as React from "react"
import Link from "next/link"
import { signOut } from "@workos-inc/authkit-nextjs"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { LogOut, Monitor, Moon, Settings, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const UserButton = () => {
    const { user } = useAuth()
    const { setTheme, theme } = useTheme()

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ")
    const fallbackName = displayName || user?.email || "User"

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full p-0">
                    <Avatar >
                        <AvatarImage
                            src={user?.profilePictureUrl || undefined}
                            alt={user?.email || "User"}
                        />
                        <AvatarFallback>
                            <User className="size-4" />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
                <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col">
                        <p className="text-sm">{fallbackName}</p>
                        {user?.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" prefetch={true}>
                        <div className="flex items-center gap-2">
                            <Settings className="size-4 text-muted-foreground" />
                            <span className="text-sm">Settings</span>
                        </div>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-4 py-1">
                    <span className="text-sm">Theme</span>
                    <div className="flex items-center gap-0.5 rounded-lg bg-muted p-1">
                        {[
                            { value: "light", icon: Sun },
                            { value: "system", icon: Monitor },
                            { value: "dark", icon: Moon },
                        ].map((item) => (
                            <Button
                                key={item.value}
                                variant="ghost"
                                size="icon-sm"
                                className={cn(
                                    "size-6 rounded-md transition-all",
                                    theme === item.value
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                                )}
                                onClick={() => setTheme(item.value)}
                            >
                                <item.icon className="size-4" />
                            </Button>
                        ))}
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <div className="flex items-center gap-2">
                        <LogOut className="size-4 text-muted-foreground" />
                        <span className="text-sm">Log out</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserButton