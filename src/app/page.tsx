import Hero from "@/components/landing/hero";
import BoxReveal from "@/components/magicui/box-reveal";
import DotPattern from "@/components/magicui/dot-pattern";
import { TopNavbar } from "@/components/top-navbar";
import { cn } from "@/lib/utils";

export default function Homepage() {
  return (
    <div>
      <TopNavbar />
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
        )}
      />
      <Hero />
    </div>
  );
}
