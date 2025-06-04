import React, { createElement } from 'react'
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import {
    LayoutTemplate,
    LockKeyhole,
    Pencil,
    RefreshCcw,
    Zap,
} from 'lucide-react'

const features = [
    {
        icon: <Pencil />,
        title: 'Write with Precision',
        text: 'Enjoy native stylus and pen support that lets you write naturally — just like on paper.',
        color: 'purple',
    },
    {
        icon: <Zap />,
        title: 'Offline First',
        text: 'Access and edit your notes anytime, anywhere, even without an internet connection.',
        color: 'blue',
    },
    {
        icon: <LockKeyhole />,
        title: 'End-to-End Encryption',
        text: 'Your notes are your own. Keep them private and secure with robust E2EE.',
        color: 'green',
    },
    {
        icon: <LayoutTemplate />,
        title: 'Block-Based Note Editor',
        text: 'Compose flexible, nested content with our powerful block editor — organize everything your way.',
        color: 'yellow',
    },
    {
        icon: <RefreshCcw />,
        title: 'Secure, Seamless Sync',
        text: 'Keep your notes synchronized across all your devices effortlessly and reliably.',
        color: 'red',
    },
]

const colorMap = {
    purple: 'bg-purple-600 text-purple-400',
    blue: 'bg-blue-600 text-blue-400',
    green: 'bg-green-600 text-green-400',
    yellow: 'bg-yellow-600 text-yellow-400',
    red: 'bg-red-600 text-red-400',
}

export default function FeatureSection() {
    return (
        <div className="grid-background mb-28">
            <main>
                <section className="py-16 md:py-24 bg-opacity-50" id="features">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Everything you need, nothing you don&apos;t.
                            </h2>
                            <p className="text-lg text-gray-400 max-w-xl mx-auto">
                                Aethernotes combines powerful features with a
                                clean, intuitive interface.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map(
                                ({ icon, title, text, color }, index) => {
                                    const iconClasses = colorMap[color]

                                    return (
                                        <div
                                            className="p-6 rounded-xl border border-neutral-700 hover:border-neutral-600 transition transform hover:scale-[1.03]"
                                            key={index}
                                        >
                                            <div
                                                className={`flex items-center justify-center w-12 h-12 ${iconClasses} bg-opacity-20 rounded-lg mb-5`}
                                            >
                                                {icon}
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">
                                                {title}
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                {text}
                                            </p>
                                        </div>
                                    )
                                }
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
