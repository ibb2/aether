// app/providers.js
"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

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
  const analyticsEnabled =
    JSON.parse(window.localStorage.getItem("analytics_allowed")!) === 1
      ? true
      : false;

  if (!analyticsEnabled) return <>{children}</>;

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
