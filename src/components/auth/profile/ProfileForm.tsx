'use client'

import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import { cn } from '@/lib/utils'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { db } from '@/db/drizzle'
import { eq } from 'drizzle-orm'
import { users } from '@/db/drizzle/schema'

const profileFormSchema = z.object({
    username: z
        .string()
        .min(2, {
            message: 'Username must be at least 2 characters.',
        })
        .max(30, {
            message: 'Username must not be longer than 30 characters.',
        }),
    email: z
        .string({
            required_error: 'Please select an email to display.',
        })
        .email(),
    bio: z.string().max(160).min(4),
    urls: z
        .array(
            z.object({
                value: z.string().url({ message: 'Please enter a valid URL.' }),
            })
        )
        .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
    bio: 'I own a computer.',
    urls: [
        { value: 'https://shadcn.com' },
        { value: 'http://twitter.com/shadcn' },
    ],
}

export default function ProfileForm() {
    const { toast } = useToast()
    const { data: session, update } = useSession()

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues,
        mode: 'onChange',
    })

    const [id, setId] = useState<string | null>(null)
    const [rendered, setRendered] = useState<boolean>(false)

    useEffect(() => {
        if (session?.user && !rendered) {
            setRendered(true)
            form.reset({
                ...form.getValues(), // Keep other existing values
                username: session.user.name ?? '',
                email: session.user.email ?? '',
            })
            setId(session.user.id ?? null)
        }
    }, [session, form, rendered])

    const { fields, append } = useFieldArray({
        name: 'urls',
        control: form.control,
    })

    async function onSubmit(data: ProfileFormValues) {
        console.log('form data', data)
        await db
            .update(users)
            .set({ name: data.username })
            .where(eq(users.email, session?.user?.email ?? ''))

        update({
            user: {
                name: data.username,
            },
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="shadcn" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your public display name. It can be your
                                real name or a pseudonym. You can only change
                                this once every 30 days.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="your@email.com"
                                    {...field}
                                />
                            </FormControl>
                            {/* <FormDescription>
                                You can manage verified email addresses in your{' '}
                                <Link href="/examples/forms">
                                    email settings
                                </Link>
                            </FormDescription> */}
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell us a little bit about yourself"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                You can <span>@mention</span> other users and
                                organizations to link to them.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div> */}
                {/* {fields.map((field, index) => (
                        <FormField
                            control={form.control}
                            key={field.id}
                            name={`urls.${index}.value`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel
                                        className={cn(index !== 0 && 'sr-only')}
                                    >
                                        URLs
                                    </FormLabel>
                                    <FormDescription
                                        className={cn(index !== 0 && 'sr-only')}
                                    >
                                        Add links to your website, blog, or
                                        social media profiles.
                                    </FormDescription>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => append({ value: '' })}
                    >
                        Add URL
                    </Button>
                </div> */}
                <Button type="submit">Update profile</Button>
            </form>
        </Form>
    )
}
