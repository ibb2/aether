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
import { signOut, useSession } from 'next-auth/react'
import { SettingsDialog } from './settings-dialog'
import Link from 'next/link'
import Usage from './usage'
import { useEvolu } from '@evolu/react'
import { User } from 'next-auth'
import { useEffect, useState } from 'react'

export function NavUser() {
    const owner = useEvolu().getOwner()
    const id = owner ? S.decodeSync(S.String)(owner?.id) : null

    const { isMobile } = useSidebar()

    const { data: session } = useSession()
    const [subscription, setSubscription] = useState(null)
    const [ran, setRan] = useState(false)

    const user = session?.user

    useEffect(() => {
        if (session === null || session === undefined) return
        if (session.user === null || session.user === undefined) return

        if (!ran) {
            fetch(`/api/stripe/subscription/${session.user.email!}`)
                .then((res) => res.json())
                .then((data) => setSubscription(data))
                .catch((err) => {})
            setRan(true)
        }
    }, [session, subscription, ran])

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
                                    src={user?.image || undefined}
                                    alt={user?.name || undefined}
                                />
                                <AvatarFallback className="rounded-lg">
                                    {user?.name?.charAt(0)?.toUpperCase() ||
                                        'CN'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {user?.name ?? 'Jane Doe'}
                                </span>
                                <span className="truncate text-xs">
                                    {user?.email ?? 'jane.doe@pm.me'}
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
                                        src={user?.image || undefined}
                                        alt={user?.name || undefined}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        {user?.name?.charAt(0)?.toUpperCase() ||
                                            'CN'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {user?.name ?? 'Jane Doe'}
                                    </span>
                                    <span className="truncate text-xs">
                                        {user?.email ?? 'jane.doe@pm.me'}
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
                                        href={
                                            !subscription?.plan.includes(
                                                'basic'
                                            )
                                                ? '/settings/billing'
                                                : '/pricing'
                                        }
                                        className="flex w-full items-center"
                                    >
                                        {!subscription?.plan.includes(
                                            'basic'
                                        ) ? (
                                            <BadgeCheck className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Sparkles className="h-4 w-4" />
                                        )}
                                        {subscription?.status === 'active' &&
                                        subscription?.plan.includes('pro')
                                            ? 'Pro Plan'
                                            : subscription?.status ===
                                                    'active' &&
                                                subscription?.plan.includes(
                                                    'plus'
                                                )
                                              ? 'Plus Plan'
                                              : 'Upgrade to Pro'}
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {id !== null && (
                                <Usage email={user?.email!} id={id} />
                            )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <SettingsDialog />
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={
                                        subscription?.status === 'active'
                                            ? '/settings/billing'
                                            : ''
                                    }
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
