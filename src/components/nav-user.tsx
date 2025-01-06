'use client'

import * as S from '@effect/schema/Schema'

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'
import { signOut } from 'next-auth/react'
import { SettingsDialog } from './settings-dialog'
import Link from 'next/link'
import Usage from './usage'
import { useEvolu } from '@evolu/react'
import { User } from 'next-auth'

export function NavUser({
    user,
    subscription,
}: {
    user: User
    subscription?: { plan: string; status: string; priceId: string } | null
}) {
    const owner = useEvolu().getOwner()
    const id = owner ? S.decodeSync(S.String)(owner?.id) : null

    const { isMobile } = useSidebar()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage
                                    src={user.image || ''}
                                    alt={user.name || 'User'}
                                />
                                <AvatarFallback className="rounded-lg">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {user.name ?? 'Jane Doe'}
                                </span>
                                <span className="truncate text-xs">
                                    {user.email ?? 'jane.doe@pm.me'}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={user.image || ''}
                                        alt={user.name || 'User'}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        {user.name?.charAt(0)?.toUpperCase() ||
                                            'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {user.name ?? 'Jane Doe'}
                                    </span>
                                    <span className="truncate text-xs">
                                        {user.email ?? 'jane.doe@pm.me'}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {!subscription ? (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/pricing"
                                        className="flex w-full items-center"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Upgrade to Pro
                                    </Link>
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/settings/billing"
                                        className="flex w-full items-center"
                                    >
                                        <BadgeCheck className="h-4 w-4 text-green-500" />
                                        {subscription.status === 'active' &&
                                        subscription.plan.includes('pro')
                                            ? 'Pro Plan'
                                            : subscription.status ===
                                                    'active' &&
                                                subscription.plan.includes(
                                                    'plus'
                                                )
                                              ? 'Plus Plan'
                                              : 'View Plan'}
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {id !== null && <Usage id={id} />}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <SettingsDialog />
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/settings/billing"
                                    className="flex w-full items-center"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Billing
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => signOut({ redirectTo: '/' })}
                        >
                            <LogOut className="h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
