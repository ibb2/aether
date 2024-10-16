import { cn } from "@/lib/utils";
import { ArrowLeft, Brush, EyeOff, User } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { usePathname, useRouter } from "next/navigation";

export const SettingsSidebar = () => {
  const pathName = usePathname();

  const windowClassName = cn(
    "bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full w-0 duration-300 transition-all",
    "dark:bg-black lg:dark:bg-black/30",
    "min-h-svh",
    "w-full",
  );

  return (
    <div className={cn("px-5")}>
      <div className="w-full min-h-svh overflow-hidden">
        <div className="flex flex-col justify-between w-full h-full pb-5 overflow-auto min-h-svh">
          <div>
            <div className="flex h-14 items-center border-b mb-3">
              <Link
                href="/app"
                className="flex items-center gap-2 font-semibold"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </div>

            <nav className="grid items-start font-medium gap-y-2">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start items-center",
                  pathName === "/settings" && "bg-slate-100 dark:bg-slate-900",
                )}
                asChild
              >
                <Link
                  href="/settings"
                  className="flex items-center w-full gap-2"
                >
                  <User />
                  Account
                </Link>
              </Button>
              {/* <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start items-center",
                  pathName === "/settings/personalisation" && "bg-zinc-100",
                )}
                asChild
              >
                <Link href="#" className="w-full gap-2">
                  <Brush />
                  Personalisation
                </Link>
              </Button> */}
              {/* <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  pathName === "/settings/privacy" &&
                    "bg-slate-100 dark:bg-slate-900",
                )}
                asChild
              >
                <Link
                  href="/settings/privacy"
                  className="flex items-center w-full gap-2"
                >
                  <EyeOff />
                  Privacy
                </Link>
              </Button> */}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

SettingsSidebar.displayName = "SettingsTableOfContentSidepanel";
