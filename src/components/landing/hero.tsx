import BoxReveal from "@/components/magicui/box-reveal";
import DotPattern from "@/components/magicui/dot-pattern";
import { TopNavbar } from "@/components/top-navbar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import HeroImage from "./image";
import { useTheme } from "next-themes";
import TypingAnimation from "../magicui/typing-animation";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="h-full w-full max-w-[32rem] items-center justify-center overflow-hidden pt-16">
      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <p className="text-[3.5rem] font-semibold">
          Aether<span className="text-[#5046e6]">.</span>
        </p>
      </BoxReveal>

      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <h1 className="mt-[.5rem] text-[1rem]">
          Note taking for{" "}
          <TypingAnimation className="text-[#5046e6]" text="everyone" />
          {/* <span className="text-[#5046e6]">Design Engineers</span> */}
        </h1>
      </BoxReveal>

      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <div className="mt-[1.5rem]">
          <p>
            {/* -&gt; 20+ free and open-source animated components built with
            <span className="font-semibold text-[#5046e6]"> React</span>,
            <span className="font-semibold text-[#5046e6]"> Typescript</span>,
            <span className="font-semibold text-[#5046e6]"> Tailwind CSS</span>,
            and
            <span className="font-semibold text-[#5046e6]"> Framer Motion</span>
            . <br />
            -&gt; 100% open-source, and customizable. <br /> */}
            The ultimate note-taking solution that combines the power of a
            block-based editor like Notion with the intuitive pen-based input of
            OneNote. Built with end-to-end encryption (E2EE) at its core, Aether
            provides a safe and private space for all your important notes,
            thoughts, and ideas.
          </p>
        </div>
      </BoxReveal>

      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <Button className="mt-[1.6rem] bg-[#5046e6]" asChild>
          <Link href="/app">Get Started</Link>
        </Button>
      </BoxReveal>
    </div>
  );
}
