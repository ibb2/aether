'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export default function GithubSignIn({ signingUp }: { signingUp?: boolean }) {
    return (
        <form
            action={async () => {
                try {
                    await authClient.signIn.social({
                        /**
                         * The social provider id
                         * @example "github", "google", "apple"
                         */
                        provider: 'github',
                        /**
                         * A URL to redirect after the user authenticates with the provider
                         * @default "/"
                         */
                        // callbackURL: '/dashboard',
                        /**
                         * A URL to redirect if an error occurs during the sign in process
                         */
                        // errorCallbackURL: '/error',
                        /**
                         * A URL to redirect if the user is newly registered
                         */
                        // newUserCallbackURL: '/welcome',
                        /**
                         * disable the automatic redirect to the provider.
                         * @default false
                         */
                        // disableRedirect: true,
                    })
                } catch (error) {
                    // Signin can fail for a number of reasons, such as the user
                    // not existing, or the user not having the correct role.
                    // In some cases, you may want to redirect to a custom error
                    console.error(error)

                    // Otherwise if a redirects happens Next.js can handle it
                    // so you can just re-thrown the error and let Next.js handle it.
                    // Docs:
                    // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
                    throw error
                }
            }}
        >
            <Button variant="outline" className="w-full" type="submit">
                {signingUp == true ? 'Sign Up ' : 'Sign In '}
                with GitHub
            </Button>
        </form>
    )
}
