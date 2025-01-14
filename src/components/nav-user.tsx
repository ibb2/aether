import * as S from '@effect/schema/Schema'

import {
    BadgeCheck,
    Bell,
    ChevronDown,
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
import UserCard from '@/components/Sidebar/nav/UserCard'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

export function NavUser({
    defaultUser,
    id,
}: {
    defaultUser: {
        name: string
        email: string
        avatar: string
    }
    id: string | null
}) {
    const { isMobile } = useSidebar()

    const { data: session } = useSession()

    const user = session?.user

    const { isPending, error, data, isFetching } = useQuery({
        queryKey: ['repoData'],
        queryFn: async () => {
            const response = await fetch(
                `/api/stripe/subscription/${user?.email!}`
            )
            return await response.json()
        },
    })

    console.log('Is Pending ', isPending)
    console.log('Is fetching', isFetching)
    if (isPending) return <UserProfileSkeleton user={defaultUser} />

    if (error) return 'An error has occurred: ' + error.message

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <UserCard user={user!} />
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
                                <UserCard user={user!} />
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {!data ? (
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
                                            !data?.plan.includes('basic')
                                                ? '/settings/billing'
                                                : '/pricing'
                                        }
                                        className="flex w-full items-center"
                                    >
                                        {!data?.plan.includes('basic') ? (
                                            <BadgeCheck className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Sparkles className="h-4 w-4" />
                                        )}
                                        {data?.status === 'active' &&
                                        data?.plan.includes('pro')
                                            ? 'Pro Plan'
                                            : data?.status === 'active' &&
                                                data?.plan.includes('plus')
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
                                        data?.status === 'active'
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

export function UserProfileSkeleton({
    user,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    return (
        <div className="flex items-center gap-3 p-3 w-full bg-background/5 rounded-lg">
            <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <Skeleton className="h-3 w-30 mb-1 bg-muted" />
                <Skeleton className="h-4 w-36 bg-muted" />
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
    )
}
