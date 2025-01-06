import React, { useState, useEffect } from 'react'
import { Progress } from './ui/progress'
import { DatabaseUsage } from '@tursodatabase/api'
import { HardDrive } from 'lucide-react'
import { cn } from '@/lib/utils'

enum PlanStorage {
    // In GB
    basic = 0.5,
    plus = 2,
    pro = 10,
}

export default function Usage(params: { email: string; id: string }) {
    const { email, id } = params
    const [usage, setUsage] = useState<number>(0)
    const [maxStorage, setMaxStorage] = useState<number>(1000)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                console.log('idid', id)
                console.log('email', email)
                // Get subscription plan
                const planResponse = await fetch(
                    `/api/stripe/subscription/${email}`
                )
                const { plan, status } = await planResponse.json()
                console.log('plan', plan)
                console.log('status', status)
                // Set max storage based on plan
                if (plan === 'pro' && status === 'active') {
                    setMaxStorage(PlanStorage.pro)
                } else if (plan === 'plus' && status === 'active') {
                    setMaxStorage(PlanStorage.plus)
                } else {
                    setMaxStorage(PlanStorage.basic)
                }

                // Get current usage
                const data = await fetch(`/api/usage/${id}`)
                const res: DatabaseUsage = await data.json()

                // Convert bytes to GB
                const usageInGb = res.usage.storage_bytes / (1024 * 1024 * 1024)
                setUsage(usageInGb)
            } catch (error) {
                console.error('Error fetching usage:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    const usagePercentage = (usage / maxStorage) * 100
    const isNearLimit = usagePercentage > 80

    if (loading) {
        return (
            <div className="px-2 py-1.5">
                <Progress value={0} className="h-2" />
            </div>
        )
    }

    return (
        <div className="px-2 py-1.5 space-y-1.5">
            <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
                <HardDrive className="h-4 w-4" />
                <span>Storage</span>
            </div>
            <div className="space-y-1">
                <Progress
                    value={usagePercentage}
                    className={cn(
                        'h-2',
                        isNearLimit && 'bg-muted-foreground/20',
                        isNearLimit && '[&>div]:bg-warning'
                    )}
                />
                <div className="px-2 flex justify-between items-center text-xs text-muted-foreground">
                    <span>{usage.toFixed(2)}GB used</span>
                    <span>{maxStorage}GB limit</span>
                </div>
            </div>
        </div>
    )
}
