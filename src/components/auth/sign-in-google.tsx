import { signIn } from '@/auth'
import { Button } from '@/components/ui/button'
import { AuthError } from 'next-auth'

export default function GoogleSignIn({
    callbackUrl,
    signingUp,
}: {
    callbackUrl: string
    signingUp?: boolean
}) {
    return (
        <form
            action={async () => {
                'use server'
                try {
                    await signIn('google', {
                        redirectTo: callbackUrl,
                    })
                } catch (error) {
                    // Signin can fail for a number of reasons, such as the user
                    // not existing, or the user not having the correct role.
                    // In some cases, you may want to redirect to a custom error
                    if (error instanceof AuthError) {
                        console.error(error)
                        // return redirect(
                        //     `${SIGNIN_ERROR_URL}?error=${error.type}`
                        // )
                    }

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
                with Google
            </Button>
        </form>
    )
}
