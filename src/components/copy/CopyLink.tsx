/**
 * v0 by Vercel.
 * @see https://v0.dev/t/RzXQWXjnx53
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function Copy() {
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen p-4 bg-gray-100">
            <div className="w-full max-w-2xl p-6 space-y-4 bg-white rounded-md shadow-md">
                <div className="flex justify-between">
                    <h2 className="text-xl font-bold">Copy link elements</h2>
                    <Button variant="ghost">Add your bucket</Button>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Input
                            value="https://dribbble.com/yeslam_zahir"
                            readOnly
                        />
                        <Button variant="default">Copy</Button>
                        <LockIcon className="w-6 h-6 text-muted-foreground" />
                        <CheckIcon className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Input
                            value="https://dribbble.com/yeslam_zahir"
                            readOnly
                        />
                        <Button variant="secondary">Copied</Button>
                        <LockIcon className="w-6 h-6 text-muted-foreground" />
                        <CheckIcon className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Input
                            value="https://dribbble.com/yeslam_zahir"
                            readOnly
                        />
                        <Button variant="outline">
                            <ClipboardIcon className="w-6 h-6" />
                        </Button>
                        <Input
                            value="https://dribbble.com/yeslam_zahir"
                            readOnly
                        />
                        <Button variant="default">Copy</Button>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">
                        Get sharable link
                    </span>
                    <LinkIcon className="w-6 h-6 text-muted-foreground" />
                </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
                <UserIcon className="w-4 h-4 inline-block" /> Yeslam_Zahir
            </div>
        </div>
    )
}

function CheckIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}

function ClipboardIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </svg>
    )
}

function LinkIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    )
}

function LockIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}

function UserIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}

function XIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
