"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PrivacyConsent from "@/components/Consent/Privacy";
import PostHogPageView from "@/app/PostHogPageView";

// const PostHogPageView = dynamic(() => import("../../app/PostHogPageView"), {
//   ssr: false,
// });

export default function ClientComponents({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or a loading indicator
  }

  return (
    <>
      <PostHogPageView />
      <PrivacyConsent />
      {children}
    </>
  );
}
