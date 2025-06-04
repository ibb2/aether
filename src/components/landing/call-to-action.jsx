import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const CtaSection = () => {
    return (
        <section className="py-16 md:py-24 mb-28">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Ready to elevate your note-taking?
                </h2>
                <p className="text-lg text-gray-400 max-w-lg mx-auto mb-10">
                    Join the Aethernotes beta today and experience the future of
                    digital note-taking.
                </p>
                <Button className="mt-8 z-10 p-6 bg-white text-black text-lg font-semibold rounded-lg hover:bg-gray-200 transition-colors shadow-lg">
                    <Link href="/app"> Get Started For Free</Link>
                </Button>
            </div>
        </section>
    )
}

export default CtaSection
