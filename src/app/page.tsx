import Hero from "@/components/landing/hero";
import HeroImage from "@/components/landing/image";
import BoxReveal from "@/components/magicui/box-reveal";
import DotPattern from "@/components/magicui/dot-pattern";
import { TopNavbar } from "@/components/top-navbar";
import { cn } from "@/lib/utils";

export default function Homepage() {
  return (
    <div className="flex flex-col items-center justify-center pt-16">
      <TopNavbar />
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
        )}
      />
      <Hero />
      <HeroImage />
    </div>
  );
}
