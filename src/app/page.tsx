'use client'

import FeaturesSectionDemo from '@/components/features-section-demo-3'
import FeatureSection from '@/components/landing/feature-section'
import { BentoFeatures } from '@/components/landing/FeatureOne'
import FeaturesSection from '@/components/landing/features-section'
import CtaSection from '@/components/landing/call-to-action'
import FooterSection from '@/components/landing/footer'
import { Action } from '@/components/landing/FeatureTwo'
import Hero from '@/components/landing/hero'
import HeroImage from '@/components/landing/image'
import PricingSection from '@/components/landing/pricing'
import BoxReveal from '@/components/magicui/box-reveal'
import DotPattern from '@/components/magicui/dot-pattern'
import { TopNavbar } from '@/components/top-navbar'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

export default function Homepage() {
    return (
        <div className="flex flex-col items-center justify-center">
            <TopNavbar />
            <DotPattern
                className={cn(
                    '[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]'
                )}
            />
            <Hero />
            <HeroImage />
            <FeatureSection />
            <PricingSection />
            <CtaSection />
            <FooterSection />
            {/* <FeaturesSection /> */}
            {/* <Action /> */}
            <Toaster />
        </div>
    )
}
