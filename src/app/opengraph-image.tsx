import { ImageResponse } from "next/og";

export const alt = "PriceCompare — SaaS Pricing Benchmark";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "64px 72px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 600,
            color: "#171717",
            letterSpacing: "-0.02em",
          }}
        >
          PriceCompare
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 600,
              color: "#0a0a0a",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            SaaS Pricing Benchmark & Competitor Analysis
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#737373",
              maxWidth: 820,
              lineHeight: 1.4,
            }}
          >
            Compare your pricing with real competitors—not AI guesses.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
