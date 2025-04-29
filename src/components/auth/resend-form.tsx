'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

const formSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
})

export function ResendForm({ signingUp }: { signingUp?: boolean }) {
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const { data, error } = await authClient.signIn.magicLink({
                email: values.email,
            })

            // await signIn('resend', {
            //     email: values.email,
            //     redirect: false,
            // }).catch((error) => {
            //     // If we get here, the email was likely sent successfully
            //     // despite the JSON parsing error
            //     if (error instanceof SyntaxError) {
            //         setStatus('success')
            //         form.reset()
            //         return
            //     }
            //     throw error
            // })

            setStatus('success')
            form.reset()
        } catch (error) {
            console.error('Magic link sign in error:', error)
            // Only set error status if it's not a SyntaxError
            if (!(error instanceof SyntaxError)) {
                setStatus('error')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-y-2"
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="email"
                                    placeholder="m@example.com"
                                    disabled={isLoading || status === 'success'}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {status === 'success' && (
                    <p className="text-sm text-green-600">
                        Magic link sent! Check your email to sign in.
                    </p>
                )}
                {status === 'error' && (
                    <p className="text-sm text-red-600">
                        Something went wrong. Please try again.
                    </p>
                )}
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || status === 'success'}
                >
                    {isLoading
                        ? 'Sending link...'
                        : status === 'success'
                          ? 'Check your email'
                          : signingUp == true
                            ? 'Sign up with Email'
                            : 'Login with Email'}
                </Button>
            </form>
        </Form>
    )
}
