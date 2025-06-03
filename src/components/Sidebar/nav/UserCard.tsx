import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from 'better-auth'

const UserCard = ({ user }: { user: User }) => {
    return (
        <>
            <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={''} alt={user?.name!} />
                <AvatarFallback className="rounded-lg">{'JE'}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Juno Ellis</span>
                <span className="truncate text-xs">
                    juno@ellistakesnotes.com
                </span>
            </div>
        </>
    )
}

export default UserCard
