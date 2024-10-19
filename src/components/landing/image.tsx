'use client'

import BoxReveal from '@/components/magicui/box-reveal'
import DotPattern from '@/components/magicui/dot-pattern'
import { TopNavbar } from '@/components/top-navbar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { BorderBeam } from '../magicui/border-beam'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '../ui/card'
import { AspectRatio } from '../ui/aspect-ratio'

export default function HeroImage() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex relative h-lvh w-[80rem] items-center justify-center mt-16">
            <Image
                src={
                    theme === 'light'
                        ? '/hero/app-light.jpeg'
                        : '/hero/app.jpeg'
                }
                alt="image"
                // fill
                className="rounded-lg"
                width={0}
                height={0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ width: '80lvw', height: 'auto' }} // optional
            />
            {/* <BorderBeam size={250} duration={12} delay={9} /> */}
        </div>
    )
}
