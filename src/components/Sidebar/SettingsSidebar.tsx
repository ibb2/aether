import { cn } from "@/lib/utils";
import { ArrowLeft, EyeOff, User } from "lucide-react";
import Link from "next/link";
import "react-complex-tree/lib/style-modern.css";
import { Button } from "../ui/Button";

export const SettingsSidebar = () => {
  const windowClassName = cn(
    "bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full w-0 duration-300 transition-all",
    "dark:bg-black lg:dark:bg-black/30",
    "min-h-svh",
    "w-full",
    // !isOpen && "border-r-transparent",
    // isOpen && "w-full",
  );

  return (
    <div className={cn(windowClassName, "px-5")}>
      <div className="w-full min-h-svh overflow-hidden">
        <div className="flex flex-col justify-between w-full h-full pb-5 overflow-auto min-h-svh">
          <div>
            <div className="flex h-14 items-center border-b mb-3">
              <Link
                href="/app"
                className="flex items-center gap-2 font-semibold"
              >
                <ArrowLeft className="h-6 w-6" />
                <span>Settings</span>
              </Link>
            </div>

            <nav className="grid items-start font-medium">
              <Button
                variant="ghost"
                className="w-full justify-start items-center"
                asChild
              >
                <Link href="#" className="w-full gap-2">
                  <User />
                  Account
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start items-center"
                asChild
              >
                <Link href="#" className="w-full gap-2">
                  <EyeOff />
                  Privacy
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

SettingsSidebar.displayName = "SettingsTableOfContentSidepanel";
