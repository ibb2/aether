'use client'

import * as React from 'react'
import {
    BadgeCheck,
    Bell,
    Check,
    Globe,
    Home,
    Keyboard,
    Link,
    Lock,
    Menu,
    MessageCircle,
    OctagonAlert,
    Paintbrush,
    ReceiptText,
    RefreshCw,
    Settings,
    User2,
    Video,
} from 'lucide-react'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from '@/components/ui/sidebar'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import PlaceholderContent from '@/components/Sidebar/settings/placeholder'
import Profile from '@/components/Sidebar/settings/account/profile'
import Danger from './Sidebar/settings/account/danger'
import Sync from './Sidebar/settings/account/sync'
import Appearance from './Sidebar/settings/general/apperances'

const data = {
    nav: {
        account: [
            { name: 'Profile', icon: User2 },
            { name: 'Sync', icon: RefreshCw },
            { name: 'Billing', icon: ReceiptText },
            { name: 'Danger', icon: OctagonAlert },
        ],
        general: [
            { name: 'Appearance', icon: Paintbrush },
            { name: 'Language & region', icon: Globe },
        ],
        // { name: 'Notifications', icon: Bell },
        // { name: 'Navigation', icon: Menu },
        // { name: 'Home', icon: Home },
        // { name: 'Messages & media', icon: MessageCircle },
        // { name: 'Accessibility', icon: Keyboard },
        // { name: 'Mark as read', icon: Check },
        // { name: 'Audio & video', icon: Video },
        // { name: 'Connected accounts', icon: Link },
        // { name: 'Privacy & visibility', icon: Lock },
        // { name: 'Advanced', icon: Settings },
    },
}

export function SettingsDialog() {
    const [open, setOpen] = React.useState(false)
    const [tab, setTab] = React.useState('Profile')

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="flex item-center px-2 py-1.5 w-full gap-x-2 text-sm hover:bg-gray-100 hover:dark:bg-gray-800 rounded-md">
                <BadgeCheck size={16} className="self-center" />
                Account
            </DialogTrigger>
            <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
                <DialogTitle className="sr-only">Settings</DialogTitle>
                <DialogDescription className="sr-only">
                    Customize your settings here.
                </DialogDescription>
                <SidebarProvider className="items-start">
                    <Sidebar collapsible="none" className="hidden md:flex">
                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarGroupLabel>Account</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {data.nav.account.map((item) => (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={item.name === tab}
                                                    onClick={() => {
                                                        setTab(item.name)
                                                    }}
                                                >
                                                    <a href="#">
                                                        <item.icon />
                                                        <span>{item.name}</span>
                                                    </a>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                            <SidebarGroup>
                                <SidebarGroupLabel>General</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {data.nav.general.map((item) => (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={item.name === tab}
                                                    onClick={() => {
                                                        setTab(item.name)
                                                    }}
                                                >
                                                    <a href="#">
                                                        <item.icon />
                                                        <span>{item.name}</span>
                                                    </a>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>
                    <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
                        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                            <div className="flex items-center gap-2 px-4">
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbLink href="#">
                                                Settings
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>
                                                {tab}
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>
                        </header>
                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
                            {getContentComponent(tab)}
                        </div>
                    </main>
                </SidebarProvider>
            </DialogContent>
        </Dialog>
    )
}

function getContentComponent(section: string) {
    switch (section) {
        case 'Profile':
            return <Profile />
        case 'Sync':
            return <Sync />
        case 'Danger':
            return <Danger />
        case 'Appearance':
            return <Appearance />
        default:
            return <PlaceholderContent />
    }
}
