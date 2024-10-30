import { LoginForm } from '@/components/login-form'

export default function Page(props: {
    searchParams: { callbackUrl: string | undefined }
}) {
    console.log('Search Params', props.searchParams)
    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <LoginForm callbackUrl={props.searchParams.callbackUrl} />
        </div>
    )
}
