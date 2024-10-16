// app/providers.js
"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, useState } from "react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "always", // or 'always' to create profiles for anonymous users as well
    capture_pageleave: true, // Enable pageleave capture
  });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  // Disable analytics solution from here
  // https://posthog.com/questions/how-can-i-disable-post-hog-on-certain-environments
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    const enabled =
      JSON.parse(localStorage.getItem("analytics_allowed")!) === 1;
    setAnalyticsEnabled(enabled);
  }, []);

  if (analyticsEnabled === null) {
    // Still determining if analytics are enabled
    return <>{children}</>;
  }

  if (!analyticsEnabled) {
    // Analytics are disabled
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
