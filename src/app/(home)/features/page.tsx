import { TopNavbar } from "@/components/top-navbar";
import {
  BrainCogIcon,
  CloudOff,
  FileText,
  Lock,
  LockKeyhole,
  PackageIcon,
  Pen,
  ThumbsUpIcon,
  TrophyIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";

export default function IconSection2ColsGrid() {
  return (
    <>
      <TopNavbar />
      {/* Icon Blocks */}
      <div className="container py-24 lg:py-32">
        <div className="max-w-4xl mx-auto">
          {/* Grid */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
            <div className="space-y-6 lg:space-y-10">
              {/* Icon Block */}
              <div className="flex">
                <LockKeyhole className="flex-shrink-0 mt-2 h-8 w-8" />
                <div className="ms-5 sm:ms-8">
                  <h3 className="text-base sm:text-lg font-semibold">
                    End 2 End Encryption
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    With E2EE your data is kept secured.
                  </p>
                </div>
              </div>
              {/* End Icon Block */}
              {/* Icon Block */}
              <div className="flex">
                <CloudOff className="flex-shrink-0 mt-2 h-8 w-8" />
                <div className="ms-5 sm:ms-8">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Offline support
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    No matter where your legs take you, your notes will be right
                    there with you.
                  </p>
                </div>
              </div>
              {/* End Icon Block */}
            </div>
            {/* End Col */}
            <div className="space-y-6 lg:space-y-10">
              {/* Icon Block */}
              <div className="flex">
                <Pen className="flex-shrink-0 mt-2 h-8 w-8" />
                <div className="ms-5 sm:ms-8">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Ink Support
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    Utilize your pen to capute thoughts and ideas. You are no
                    longer bound to just keyboard and mouse.
                  </p>
                </div>
              </div>
              {/* Icon Block */}
              <div className="flex">
                <FileText className="flex-shrink-0 mt-2 h-8 w-8" />
                <div className="ms-5 sm:ms-8">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Browser Storage
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    Your data is stored right there on your device. Backed by
                    SQLite, and performant database solution for the web.
                  </p>
                </div>
              </div>
              {/* End Icon Block */}
            </div>
            {/* End Col */}
          </div>
          {/* End Grid */}
        </div>
      </div>
      {/* End Icon Blocks */}
    </>
  );
}
