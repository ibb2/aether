import React, { useState } from 'react'
import { Progress } from './ui/progress'
import { DatabaseUsage } from '@tursodatabase/api'
import { Usb } from 'lucide-react'

enum PlanStorage {
    // In Mb
    basic = 512,
    plus = 2048,
    pro = 10240,
}

export default function Usage(params: { id: string }) {
    const [usage, setUsage] = useState(0)

    React.useEffect(() => {
        async function getUsage() {
            console.log('evoluid', params.id)

            const data = await fetch(`/api/usage/${params.id}`)
            const res: DatabaseUsage = await data.json()

            setUsage(res.usage.storage_bytes)
            console.log('Usage', res)
        }
        getUsage()
    })

    // function calcVal() {
    //   stripe.
    //   const storage = PlanStorage.basic
    // }

    return (
        <div>
            <Progress value={usage} />
        </div>
    )
}
