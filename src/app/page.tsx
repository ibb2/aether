import { BentoFeatures } from '@/components/landing/FeatureOne'
import { Action } from '@/components/landing/FeatureTwo'
import Hero from '@/components/landing/hero'
import HeroImage from '@/components/landing/image'
import BoxReveal from '@/components/magicui/box-reveal'
import DotPattern from '@/components/magicui/dot-pattern'
import { TopNavbar } from '@/components/top-navbar'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

export default function Homepage() {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-y-32">
            <TopNavbar />
            <DotPattern
                className={cn(
                    '[mask-image:radial-gradient(700px_circle_at_center,white,transparent)]'
                )}
            />
            <Hero />
            <HeroImage />
            <BentoFeatures />
            <Action />
            <Toaster />
        </div>
    )
}
