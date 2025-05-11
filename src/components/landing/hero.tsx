'use client'

import BoxReveal from '@/components/magicui/box-reveal'
import DotPattern from '@/components/magicui/dot-pattern'
import { TopNavbar } from '@/components/top-navbar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import HeroImage from './image'
import { useTheme } from 'next-themes'
import TypingAnimation from '../magicui/typing-animation'
import Link from 'next/link'
import { EvoluProvider, useEvolu } from '@evolu/react'
import { evolu } from '@/db/db'
import React from 'react'
import { AnimatedShinyText } from '../magicui/animated-shiny-text'
import { ArrowRightIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Hero() {
    const owner = evolu.getOwner()
    const [ownerExists, setOwnerExists] = React.useState(false)
    const [rendered, SetRendered] = React.useState(false)
    const [noteTakingText, setNoteTakingText] = React.useState('')
    const [pos, setPos] = React.useState(0)

    const router = useRouter()

    React.useEffect(() => {
        setOwnerExists(evolu.getOwner()?.id !== null)
    }, [owner])

    return (
        <EvoluProvider value={evolu}>
            <div className="flex flex-col h-full w-full max-w-3xl items-center justify-center overflow-hidden pt-16">
                <div className="z-10 flex items-center justify-center">
                    <div
                        className={cn(
                            'group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800'
                        )}
                    >
                        <AnimatedShinyText
                            className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400"
                            onClick={() => router.push('/')}
                        >
                            <span>✨ Introducing Aethernotes Beta</span>
                            <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                        </AnimatedShinyText>
                    </div>
                </div>
                <div className="flex flex-col items-center mb-6">
                    <p className="text-[5rem] font-semibold -mb-5">
                        Think in ink.
                    </p>
                    <p className="text-[5rem] font-semibold">
                        Organise in blocks.
                    </p>
                </div>
                <p className="flex text-xl text-center max-w-2xl">
                    Write with your pen. Build with blocks. Store it all
                    securely, offline.
                </p>
                {/* {ownerExists ? (
                        <Button className="mt-[1.6rem] bg-[#5046e6]" asChild>
                            <Link href="/app">Go to app</Link>
                        </Button>
                    ) : ( */}
                <Button className="mt-8 z-10 p-6">
                    <Link href="/app">Get Started</Link>
                </Button>
                {/* )} */}
            </div>
        </EvoluProvider>
    )
}
