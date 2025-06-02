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
            <div className="flex flex-col h-full w-full max-w-3xl items-center justify-center overflow-hidden mb-28">
                <section className="hero-gradient pt-32 pb-16 md:pt-40 md:pb-24 text-center relative overflow-hidden">
                    {/* <div className="z-10 flex mb-6 items-center justify-center">
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
                    </div> */}
                    <div className="container mx-auto px-6 relative z-10">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Think in{' '}
                            <span className="text-purple-600 dark:text-purple-400">
                                ink
                            </span>
                            .
                            <br /> Organise in{' '}
                            <span className="text-blue-600 dark:text-blue-400">
                                blocks
                            </span>
                            .
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                            Write with your pen. Build with blocks. Store it all
                            securely, offline. The best of both worlds for a
                            seamless note-taking experience.
                        </p>
                    </div>
                    <Button className="mt-8 z-10 p-6 bg-white text-black text-lg font-semibold rounded-lg hover:bg-gray-200 transition-colors shadow-lg">
                        <Link href="/app">Get Started</Link>
                    </Button>
                </section>
                {/* {ownerExists ? (
                        <Button className="mt-[1.6rem] bg-[#5046e6]" asChild>
                            <Link href="/app">Go to app</Link>
                        </Button>
                    ) : ( */}

                {/* )} */}
            </div>
        </EvoluProvider>
    )
}
