'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'

export default function HeroImage() {
    const { resolvedTheme } = useTheme()

    return (
        <div className="w-2/3 xl:w-5/6 2xl:3/5 mb-28">
            <Image
                src={
                    resolvedTheme === 'light'
                        ? '/hero/Aethernotes-light.jpeg'
                        : '/hero/Aethernotes.jpeg'
                }
                className="flex relative h-lvh items-center justify-center rounded-lg"
                alt="Hero Image"
                width={1920}
                height={1080}
                // sizes="100vh"
                quality={100}
                style={{
                    width: '100%',
                    height: 'auto',
                }}
                layout="responsive"
            />
        </div>
        // <Image
        //     src={
        //         resolvedTheme === 'light'
        //             ? '/hero/app-light.png'
        //             : '/hero/app.png'
        //     }
        //     alt="image"
        //     className=""
        //     width={0}
        //     height={0}
        //     sizes="(max-width: 768px) 100vw, (max-width: 1024px)100vw, (max-width: 1200px) 100vw, 100vw"
        //     // style={{ width: 'auto', height: 'auto' }} // optional
        //     // sizes="100vw"
        //     style={{
        //         width: '100%',
        //         height: 'auto',
        //     }}
        //     quality={100}
        //     priority
        // />
        // <image
        //    priority
        //    src="{IMAGE_URL}"
        //    layout="fill"
        //    objectFit="cover"
        //    objectPosition="center"
        //    alt="hero image example"
        //  />
    )
}
