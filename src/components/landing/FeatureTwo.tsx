/** eslint-disable @next/next/no-img-element */
import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid'
import {
    Bell,
    Calendar,
    CloudOff,
    FileText,
    FormInput,
    Globe,
    Lock,
    Pen,
    RefreshCw,
} from 'lucide-react'
import TypingAnimation from '../magicui/typing-animation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export async function Action() {
    return (
        <div className="flex flex-col items-center justify-center w-3/5 pt-32">
            <p className="text-5xl font-bold">Join us in this early access.</p>
            <p className="text-2xl text-center pt-4">
                Unleash your creativity, secure your data, and work seamlessly
                across all your devices
            </p>
            <Button className="w-72 mt-8">
                <Link href="/app">Get started now.</Link>
            </Button>
        </div>
    )
}
