// app/PostHogPageView.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

export default function PostHogPageView(): null {
  console.log(
    "blah blah blah",
    window.localStorage.getItem("analytics_allowed"),
  );

  const analyticsDisabled =
    JSON.parse(window.localStorage.getItem("analytics_allowed")!) === 1
      ? true
      : false;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  if (!posthog.__loaded) {
    console.info("Posthog successfully loaded");
  }

  useEffect(() => {
    // Track pageviews
    if (analyticsDisabled) return;

    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthog, analyticsDisabled]);

  return null;
}
