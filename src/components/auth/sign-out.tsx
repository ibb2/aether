// import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

export function SignOutDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Sign Out</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sign Out</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to sign out?.
                    </DialogDescription>
                </DialogHeader>
                <Button
                    variant="destructive"
                    onClick={() =>
                        signOut({
                            redirectTo: '/',
                        })
                    }
                >
                    Sign Out
                </Button>
            </DialogContent>
        </Dialog>
    )
}
