/**
 * v0 by Vercel.
 * @see https://v0.dev/t/RzXQWXjnx53
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

'use client'

import * as S from '@effect/schema/Schema'
import { formatError } from '@effect/schema/TreeFormatter'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import React from 'react'
import { evolu } from '@/db/db'
import { cn } from '@/lib/utils'
import { Check, Clipboard, RotateCcw } from 'lucide-react'
import {
    Mnemonic,
    NonEmptyString1000,
    Owner,
    parseMnemonic,
    useEvolu,
    useOwner,
} from '@evolu/react'
import { Effect, Exit } from 'effect'

export default function CopySecret() {
    const evolu = useEvolu()

    const [mnemonic, setMnemonic] = React.useState('')
    const [restoreMnemonic, setRestoreMnemonic] = React.useState('')
    const [copied, onCopied] = React.useState(false)
    const [blurred, onBlurred] = React.useState(true)
    const [isAnimating, setIsAnimating] = React.useState(false)

    const owner = useOwner()

    React.useEffect(() => {
        if (owner && owner.mnemonic) {
            setMnemonic(owner.mnemonic)
            setRestoreMnemonic(owner.mnemonic)
        }
    }, [owner])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(mnemonic)
        onCopied(true)
        setIsAnimating(true)

        setTimeout(() => {
            setIsAnimating(false)
            setTimeout(() => onCopied(false), 300) // Reset after animation
        }, 1000)
    }

    const handleRestoreOwnerClick = () => {
        prompt(NonEmptyString1000, 'Your Mnemonic', (mnemonic: any) => {
            parseMnemonic(mnemonic)
                .pipe(Effect.runPromiseExit)
                .then(
                    Exit.match({
                        onFailure: (error) => {
                            alert(JSON.stringify(error, null, 2))
                        },
                        onSuccess: (mnemonic) => {
                            evolu.restoreOwner(mnemonic)
                        },
                    })
                )
        })
    }

    return (
        <div className="w-full  space-y-4">
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Input
                        value={restoreMnemonic}
                        // readOnly
                        defaultValue={mnemonic}
                        onChange={(e) => setRestoreMnemonic(e.target.value)}
                    />
                    <Button onClick={copyToClipboard} className="max-w-15">
                        {copied ? (
                            <Check className="text-green-600" />
                        ) : (
                            <Clipboard />
                        )}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleRestoreOwnerClick}
                    >
                        <RotateCcw />
                    </Button>
                    {/* {copied && <span className="text-green-400">Copied</span>} */}
                </div>
            </div>
        </div>
    )
}

const prompt = <From extends string, To>(
    schema: S.Schema<To, From, never>,
    message: string,
    onSuccess: (value: To) => void
) => {
    const value = window.prompt(message)
    if (value == null) return // on cancel
    const a = S.decodeUnknownEither(schema)(value)
    if (a._tag === 'Left') {
        alert(formatError(a.left))
        return
    }
    onSuccess(a.right)
}
