import Link from "next/link";

// Global not-found for paths that don't match a locale segment.
// Renders its own <html> because there is no root layout outside [locale].
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>404 — Page not found</h1>
          <p style={{ marginTop: "0.5rem" }}>
            <Link href="/en">Go to homepage</Link>
          </p>
        </div>
      </body>
    </html>
  );
}
