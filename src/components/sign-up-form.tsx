import Link from 'next/link'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import GoogleSignIn from './auth/sign-in-google'
import GithubSignIn from './auth/sign-in-github'
import { ResendForm } from './auth/resend-form'

export function SignUpForm() {
    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Sign up</CardTitle>
                <CardDescription>
                    Enter your email below to sign up for an account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <ResendForm signingUp={true} />
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <GoogleSignIn signingUp={true} />
                    <GithubSignIn signingUp={true} />
                </div>

                <div className="mt-4 text-center text-sm">
                    Have and account?{' '}
                    <Link href="/login" className="underline">
                        Login
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
