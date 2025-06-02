import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from 'better-auth'

const UserCard = ({ user }: { user: User }) => {
    return (
        <>
            <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.image!} alt={user?.name!} />
                <AvatarFallback className="rounded-lg">
                    {user?.name?.charAt(0)?.toUpperCase() || 'CN'}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name!}</span>
                <span className="truncate text-xs">{user?.email!}</span>
            </div>
        </>
    )
}

export default UserCard
