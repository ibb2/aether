/** eslint-disable @next/next/no-img-element */
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import {
  Bell,
  Calendar,
  CloudOff,
  FileText,
  FormInput,
  Globe,
  Lock,
  Pen,
  RefreshCw,
} from "lucide-react";
import TypingAnimation from "../magicui/typing-animation";
import { Button } from "../ui/Button";

const features = [
  {
    Icon: FileText,
    name: "Save your files",
    description: "We automatically save your files as you type.",
    href: "/",
    cta: "Learn more",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: Lock,
    name: "E2EE",
    description: "Your data for your eyes only.",
    href: "/",
    cta: "Learn more",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    name: "Sync",
    Icon: RefreshCw,
    description: "Sync between devices.",
    href: "/",
    cta: "Learn more",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Pen,
    name: "Ink Support",
    description: "Notes are more than just your keyboard and mouse.",
    href: "/",
    cta: "Learn more",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: CloudOff,
    name: "Offline",
    description: "Your notes go where you do.",
    href: "/",
    cta: "Learn more",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export async function Action() {
  return (
    <div className="flex flex-col items-center justify-center w-4/5 pt-32">
      <p className="text-5xl font-bold">
        Ready to experience the future of note-taking?
      </p>
      <p className="text-2xl text-center pt-4">
        Unleash your creativity, secure your data, and work seamlessly across
        all your devices
      </p>
      <Button className="w-72 mt-8">Get started now.</Button>
    </div>
  );
}
