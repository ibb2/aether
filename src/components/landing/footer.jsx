import Image from 'next/image'
import AetherIconSvg from '@/assets/aether-icon'

export default function FooterSection() {
    return (
        <footer className="py-12 px-12 w-full border-t border-gray-800">
            <div className="mx-auto w-full px-6 p-20 text-center">
                <div className="flex justify-center items-center mb-6 mt-12 gap-x-2">
                    <AetherIconSvg
                        width={38}
                        alt="Aethernotes Icon"
                        className="dark:bg-white rounded-sm"
                    />
                    <span className="text-xl font-semibold text-gray-300">
                        Aether
                    </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                    © {new Date().getFullYear()} Aethernotes. All rights
                    reserved.
                </p>
                <div className="flex justify-center space-x-4 mb-12">
                    <a
                        className="text-gray-400 hover:text-white transition-colors"
                        href="#privacy"
                    >
                        Privacy Policy
                    </a>{' '}
                    {/* Use React Router for actual navigation if multi-page */}
                    <a
                        className="text-gray-400 hover:text-white transition-colors"
                        href="#terms"
                    >
                        Terms of Service
                    </a>
                </div>
            </div>
        </footer>
    )
}
