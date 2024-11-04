'use client'

import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { Button } from '.@/components/ui/button'

export function PrivacyToast() {
    const { toast } = useToast()

    return (
        <Button
            className="fixed top-48 right-8"
            variant="secondary"
            onClick={() => {
                toast({
                    title: 'Scheduled: Catch up ',
                    description: 'Friday, February 10, 2023 at 5:57 PM',
                    action: (
                        <ToastAction altText="Goto schedule to undo">
                            Undo
                        </ToastAction>
                    ),
                })
            }}
        >
            Add to calendar
        </Button>
    )
}
