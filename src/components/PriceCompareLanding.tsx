"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

type Stage = "hero" | "loading" | "results";

const LOADING_STEPS = [
  "Analyzing your SaaS...",
  "Finding competitors...",
  "Checking pricing pages...",
  "Building your benchmark...",
] as const;

const COMPETITORS = [
  { name: "OpusClip", entry: "$15", pro: "$29" },
  { name: "Klap", entry: "$14", pro: "$39" },
  { name: "Vizard", entry: "$29", pro: "$39" },
  { name: "2short.ai", entry: "$9.90", pro: "$19.90" },
  { name: "Submagic", entry: "$12", pro: "$39" },
] as const;

const KPIS = [
  { label: "Free plan", value: "6 / 10" },
  { label: "Median entry price", value: "$15/mo" },
  { label: "Median Pro price", value: "$35/mo" },
  { label: "Median annual discount", value: "20%" },
  { label: "Most common pricing metric", value: "Video minutes" },
] as const;

function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function PriceCompareLanding() {
  const [saasUrl, setSaasUrl] = useState("");
  const [stage, setStage] = useState<Stage>("hero");
  const [loadingStep, setLoadingStep] = useState(0);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [emailError, setEmailError] = useState("");
  const [urlError, setUrlError] = useState("");
  const urlEnteredRef = useRef(false);
  const resultsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    track("pricecompare_page_view");
  }, []);

  useEffect(() => {
    if (stage !== "loading") return;

    setLoadingStep(0);
    const timers: ReturnType<typeof setTimeout>[] = [];

    LOADING_STEPS.forEach((_, index) => {
      if (index === 0) return;
      timers.push(
        setTimeout(() => {
          setLoadingStep(index);
        }, index * 900),
      );
    });

    timers.push(
      setTimeout(() => {
        setStage("results");
      }, LOADING_STEPS.length * 900),
    );

    return () => timers.forEach(clearTimeout);
  }, [stage]);

  useEffect(() => {
    if (stage === "results" && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [stage]);

  function markUrlEntered(value: string) {
    const normalized = normalizeUrl(value);
    if (!normalized || urlEnteredRef.current) return;
    urlEnteredRef.current = true;
    track("saas_url_entered", { saas_url: normalized });
  }

  function handleAnalyze(e: FormEvent) {
    e.preventDefault();
    const normalized = normalizeUrl(saasUrl);

    if (!normalized || normalized === "https://") {
      setUrlError("Enter your SaaS URL to continue.");
      return;
    }

    let valid = false;
    try {
      valid = Boolean(new URL(normalized));
    } catch {
      valid = false;
    }
    if (!valid) {
      setUrlError("Enter a valid URL like https://your-saas.com");
      return;
    }

    setUrlError("");
    setSaasUrl(normalized);
    markUrlEntered(normalized);
    track("analyze_pricing_clicked", { saas_url: normalized });
    setStage("loading");
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid email address.");
      setEmailStatus("error");
      return;
    }

    setEmailError("");
    setEmailStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          saas_url: normalizeUrl(saasUrl) || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      track("email_submitted", {
        saas_url: normalizeUrl(saasUrl) || undefined,
      });
      setEmailStatus("done");
    } catch {
      setEmailError("Something went wrong. Please try again.");
      setEmailStatus("error");
    }
  }

  return (
    <div className="min-h-full bg-white text-neutral-900">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <div className="text-[15px] font-semibold tracking-tight">PriceCompare</div>
        <span className="text-xs text-neutral-400">Early access</span>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 pb-24">
        <section className="pt-10 sm:pt-16">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl sm:leading-[1.1]">
            Pricing your new SaaS?
            <br />
            See what 10 real competitors charge.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-500 sm:text-lg">
            Paste your SaaS URL and get a pricing benchmark based on real
            competitor pricing.
          </p>

          <form onSubmit={handleAnalyze} className="mt-10">
            <label htmlFor="saas-url" className="sr-only">
              SaaS URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <input
                id="saas-url"
                type="text"
                inputMode="url"
                autoComplete="url"
                placeholder="https://your-saas.com"
                value={saasUrl}
                onChange={(e) => {
                  setSaasUrl(e.target.value);
                  if (urlError) setUrlError("");
                }}
                onBlur={() => markUrlEntered(saasUrl)}
                className="h-12 w-full flex-1 rounded-lg border border-neutral-300 bg-white px-4 text-[15px] text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
              <button
                type="submit"
                className="h-12 shrink-0 rounded-lg bg-neutral-950 px-5 text-[15px] font-medium text-white transition hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              >
                Analyze Pricing →
              </button>
            </div>
            {urlError ? (
              <p className="mt-2 text-sm text-red-600">{urlError}</p>
            ) : null}
          </form>

          <p className="mt-4 text-sm text-neutral-400">
            Real competitors. Real pricing data. No AI guesses.
          </p>
        </section>

        {stage === "loading" ? (
          <section
            className="mt-16 rounded-xl border border-neutral-200 px-6 py-12 text-center"
            aria-live="polite"
          >
            <div className="mx-auto mb-5 h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
            <p className="text-base font-medium text-neutral-800">
              {LOADING_STEPS[loadingStep]}
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              This usually takes a few seconds.
            </p>
          </section>
        ) : null}

        {stage === "results" ? (
          <section ref={resultsRef} className="mt-16 space-y-10 scroll-mt-8">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
                  Your Pricing Benchmark
                </h2>
                <span className="rounded border border-neutral-200 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                  Example report
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                AI Video Clipping · 10 competitors
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {KPIS.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-neutral-200 px-4 py-4"
                >
                  <p className="text-xs text-neutral-500">{kpi.label}</p>
                  <p className="mt-1.5 text-xl font-semibold tracking-tight text-neutral-950">
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
                Competitor Pricing
              </h3>
              <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Competitor</th>
                      <th className="px-4 py-3 font-medium">Entry</th>
                      <th className="px-4 py-3 font-medium">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPETITORS.map((row) => (
                      <tr
                        key={row.name}
                        className="border-b border-neutral-100 last:border-b-0"
                      >
                        <td className="px-4 py-3 font-medium text-neutral-900">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">{row.entry}</td>
                        <td className="px-4 py-3 text-neutral-600">{row.pro}</td>
                      </tr>
                    ))}
                    <tr>
                      <td
                        colSpan={3}
                        className="bg-neutral-50 px-4 py-3 text-sm text-neutral-500"
                      >
                        + 5 more competitors
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
                Your Position
              </h3>
              <div className="mt-4 rounded-xl border border-neutral-200 px-5 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs text-neutral-500">Your SaaS</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      $9/mo
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs text-neutral-500">Market median</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-500">
                      $15/mo
                    </p>
                  </div>
                </div>

                <div className="relative mt-6 h-2 rounded-full bg-neutral-100">
                  <div
                    className="absolute left-0 top-0 h-2 rounded-full bg-neutral-300"
                    style={{ width: "60%" }}
                  />
                  <div
                    className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-neutral-900 bg-white"
                    style={{ left: "36%" }}
                    title="Your SaaS"
                  />
                  <div
                    className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-neutral-400"
                    style={{ left: "60%" }}
                    title="Market median"
                  />
                </div>

                <p className="mt-4 text-sm font-medium text-neutral-900">
                  40% below market median
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 px-5 py-6 sm:px-8 sm:py-8">
              <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                Want the full report?
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
                Get pricing data from 10 real competitors when PriceCompare
                launches.
              </p>

              {emailStatus === "done" ? (
                <p className="mt-6 text-sm font-medium text-neutral-900">
                  You&apos;re on the list. We&apos;ll email you when PriceCompare
                  launches.
                </p>
              ) : (
                <form onSubmit={handleEmailSubmit} className="mt-6">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label htmlFor="email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      disabled={emailStatus === "loading"}
                      className="h-11 w-full flex-1 rounded-lg border border-neutral-300 bg-white px-4 text-[15px] outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={emailStatus === "loading"}
                      className="h-11 shrink-0 rounded-lg bg-neutral-950 px-5 text-[15px] font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                    >
                      {emailStatus === "loading"
                        ? "Submitting..."
                        : "Get Early Access"}
                    </button>
                  </div>
                  {emailError ? (
                    <p className="mt-2 text-sm text-red-600">{emailError}</p>
                  ) : null}
                </form>
              )}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="mx-auto w-full max-w-3xl border-t border-neutral-100 px-6 py-8">
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} PriceCompare. Demand validation preview —
          sample data shown for demonstration.
        </p>
      </footer>
    </div>
  );
}
