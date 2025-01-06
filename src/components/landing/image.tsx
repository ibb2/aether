'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'

export default function HeroImage() {
    const { resolvedTheme } = useTheme()

    return (
        <div className="flex relative h-lvh w-[80rem] items-center justify-center">
            <Image
                src={
                    resolvedTheme === 'light'
                        ? '/hero/app-light.jpeg'
                        : '/hero/app.jpeg'
                }
                alt="image"
                className="rounded-lg"
                width={0}
                height={0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ width: '80lvw', height: 'auto' }} // optional
            />
        </div>
    )
}
