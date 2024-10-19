'use client'

import BoxReveal from '@/components/magicui/box-reveal'
import DotPattern from '@/components/magicui/dot-pattern'
import { TopNavbar } from '@/components/top-navbar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import HeroImage from './image'
import { useTheme } from 'next-themes'
import TypingAnimation from '../magicui/typing-animation'
import Link from 'next/link'
import { EvoluProvider, useEvolu } from '@evolu/react'
import { evolu } from '@/db/db'
import React from 'react'
import { render } from 'react-dom'

export default function Hero() {
    const owner = evolu.getOwner()
    const [ownerExists, setOwnerExists] = React.useState(false)
    const [rendered, SetRendered] = React.useState(false)
    const [noteTakingText, setNoteTakingText] = React.useState('')
    const [pos, setPos] = React.useState(0)

    const whoIsNoteTakingFor = React.useMemo(
        () => ['Students', 'Engineers', 'Designers', 'Everyone.'],
        []
    )

    const getWhoIsNoteTakingFor = React.useCallback(() => {
        setPos(pos + 1)
        if (pos > 3) setPos(0)
        return whoIsNoteTakingFor[pos]
    }, [setPos, whoIsNoteTakingFor])

    React.useEffect(() => {
        if (!rendered) {
            const settingFirstNoteTakingText = async () => {
                SetRendered(true)
                setNoteTakingText(getWhoIsNoteTakingFor())
            }
            settingFirstNoteTakingText()
        }

        const settingNoteTakingText = async () => {
            console.log('settingNoteTakingText', getWhoIsNoteTakingFor())
            await setTimeout(() => {
                setNoteTakingText(getWhoIsNoteTakingFor())
            }, 1000)
        }
        if (rendered) settingNoteTakingText()
    }, [rendered, setNoteTakingText, getWhoIsNoteTakingFor])

    React.useEffect(() => {
        setOwnerExists(evolu.getOwner()?.id !== null)
    }, [owner])

    return (
        <EvoluProvider value={evolu}>
            <div className="h-full w-full max-w-[32rem] items-center justify-center overflow-hidden pt-16">
                <BoxReveal boxColor={'#5046e6'} duration={0.5}>
                    <p className="text-[3.5rem] font-semibold">
                        Aether<span className="text-[#5046e6]">.</span>
                    </p>
                </BoxReveal>

                <BoxReveal boxColor={'#5046e6'} duration={0.5}>
                    <>
                        <h1 className="mt-[.5rem] text-[1rem]">
                            Note taking for{' '}
                            {/* <span className="text-[#5046e6]">Design Engineers</span> */}
                        </h1>
                        <TypingAnimation
                            className="text-[#5046e6]"
                            text={'Everyone.'}
                        />
                    </>
                </BoxReveal>

                <BoxReveal boxColor={'#5046e6'} duration={0.5}>
                    <div className="mt-[1.5rem]">
                        <p>
                            {/* -&gt; 20+ free and open-source animated components
                            built with
                            <span className="font-semibold text-[#5046e6]">
                                {' '}
                                React
                            </span>
                            ,
                            <span className="font-semibold text-[#5046e6]">
                                {' '}
                                Typescript
                            </span>
                            ,
                            <span className="font-semibold text-[#5046e6]">
                                {' '}
                                Tailwind CSS
                            </span>
                            , and
                            <span className="font-semibold text-[#5046e6]">
                                {' '}
                                Framer Motion
                            </span>
                            . <br />
                            -&gt; 100% open-source, and customizable. <br /> */}
                            The ultimate note-taking solution that combines the
                            power of a block-based editor like{' '}
                            <span className="font-semibold text-[#5046e6]">
                                {' '}
                                Notion
                            </span>{' '}
                            with the intuitive pen-based input of{' '}
                            <span className="font-semibold text-[#5046e6]">
                                {' '}
                                OneNote
                            </span>
                            .
                            <br />
                            Built with{' '}
                            <span className="font-semibold text-[#5046e6]">
                                {' '}
                                end-to-end
                            </span>{' '}
                            encryption{' '}
                            <span className="font-semibold text-[#5046e6]">
                                {' '}
                                (E2EE)
                            </span>{' '}
                            at its core, Aether provides a safe and private
                            space for all your important notes, thoughts, and
                            ideas.
                        </p>
                    </div>
                </BoxReveal>

                <BoxReveal boxColor={'#5046e6'} duration={0.5}>
                    {ownerExists ? (
                        <Button className="mt-[1.6rem] bg-[#5046e6]" asChild>
                            <Link href="/app">Go to app</Link>
                        </Button>
                    ) : (
                        <Button className="mt-[1.6rem] bg-[#5046e6]" asChild>
                            <Link href="/app">Get Started</Link>
                        </Button>
                    )}
                </BoxReveal>
            </div>
        </EvoluProvider>
    )
}
