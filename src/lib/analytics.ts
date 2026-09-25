import posthog from "posthog-js";

type EventProps = Record<string, string | number | boolean | null | undefined>;

let initialized = false;

export function initAnalytics() {
  if (typeof window === "undefined" || initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
  });
  initialized = true;
}

export function track(event: string, properties?: EventProps) {
  if (typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics]", event, properties ?? {});
    }
    return;
  }

  initAnalytics();
  posthog.capture(event, properties);
}
