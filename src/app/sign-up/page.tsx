import { LoginForm } from '@/components/login-form'
import { SignUpForm } from '@/components/sign-up-form'

export default function Page(props: {
    searchParams: { callbackUrl: string | undefined }
}) {
    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <SignUpForm callbackUrl={props.searchParams.callbackUrl} />
        </div>
    )
}
