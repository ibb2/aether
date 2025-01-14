import * as React from 'react'
import {
    BookOpen,
    Bot,
    Cloud,
    Command,
    Frame,
    LifeBuoy,
    Map,
    PieChart,
    Plus,
    Send,
    Settings2,
    SquareTerminal,
} from 'lucide-react'

import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import NavNotes from '@/components/Sidebar/nav-notes'
import NavFragmentNotes from '@/components/Sidebar/nav-fragment-notes'
import favicon from '@/assets/favicon.ico'
import Image from 'next/image'
import NewNotes from './dialogs/notes/new-notes'
import { ReactSketchCanvasRef } from 'react-sketch-canvas'

const data = {
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: 'https://github.com/shadcn.png',
    },
    navMain: [
        {
            title: 'Playground',
            url: '#',
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: 'History',
                    url: '#',
                },
                {
                    title: 'Starred',
                    url: '#',
                },
                {
                    title: 'Settings',
                    url: '#',
                },
            ],
        },
        {
            title: 'Models',
            url: '#',
            icon: Bot,
            items: [
                {
                    title: 'Genesis',
                    url: '#',
                },
                {
                    title: 'Explorer',
                    url: '#',
                },
                {
                    title: 'Quantum',
                    url: '#',
                },
            ],
        },
        {
            title: 'Documentation',
            url: '#',
            icon: BookOpen,
            items: [
                {
                    title: 'Introduction',
                    url: '#',
                },
                {
                    title: 'Get Started',
                    url: '#',
                },
                {
                    title: 'Tutorials',
                    url: '#',
                },
                {
                    title: 'Changelog',
                    url: '#',
                },
            ],
        },
        {
            title: 'Settings',
            url: '#',
            icon: Settings2,
            items: [
                {
                    title: 'General',
                    url: '#',
                },
                {
                    title: 'Team',
                    url: '#',
                },
                {
                    title: 'Billing',
                    url: '#',
                },
                {
                    title: 'Limits',
                    url: '#',
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: 'Support',
            url: `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`,
            icon: LifeBuoy,
        },
        {
            title: 'Feedback',
            url: `mailto:${process.env.NEXT_PUBLIC_FEEDBACK_EMAIL}`,
            icon: Send,
        },
    ],
    projects: [
        {
            name: 'Design Engineering',
            url: '#',
            icon: Frame,
        },
        {
            name: 'Sales & Marketing',
            url: '#',
            icon: PieChart,
        },
        {
            name: 'Travel',
            url: '#',
            icon: Map,
        },
    ],
}

export function AppSidebar({
    canvasRef,
    id,
}: {
    canvasRef: React.RefObject<ReactSketchCanvasRef>
    id: string
}) {
    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <SidebarMenu className="flex flex-row items-center w-full">
                    <SidebarMenuItem className="flex flex-row w-full items-center gap-x-2">
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    {/* <Cloud className="size-4" /> */}
                                    <Image
                                        width={24}
                                        height={24}
                                        src={favicon}
                                        alt="Favicon"
                                    />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        Aether Notes
                                    </span>
                                    <span className="truncate text-xs">
                                        Solutions
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <div className="h-full">
                        <NewNotes />
                        <span className="sr-only">Add new notebooks</span>
                    </div>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavFragmentNotes canvasRef={canvasRef} />
                <NavNotes canvasRef={canvasRef} />
                {/* <NavMain items={data.navMain} />
                <NavProjects projects={data.projects} /> */}
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser defaultUser={data.user} id={id} />
            </SidebarFooter>
        </Sidebar>
    )
}
