import { LoginForm } from '@/components/login-form'

export default function Page(props: {
    searchParams: { callbackUrl: string | undefined }
}) {
    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <LoginForm callbackUrl={props.searchParams.callbackUrl} />
        </div>
    )
}
