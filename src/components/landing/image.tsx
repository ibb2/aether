'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'

export default function HeroImage() {
    const { resolvedTheme } = useTheme()

    return (
        <Image
            src={
                resolvedTheme === 'light'
                    ? '/hero/app-light.png'
                    : '/hero/app.png'
            }
            alt="image"
            className="flex relative h-lvh max-w-5xl items-center justify-center rounded-lg"
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 33vw"
            // style={{ width: 'auto', height: 'auto' }} // optional
            // sizes="100vw"
            style={{
                width: '100%',
                height: 'auto',
            }}
        />
    )
}
