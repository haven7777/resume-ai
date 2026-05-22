// Inert unless NEXT_PUBLIC_SENTRY_DSN is set. The dynamic import keeps the
// Sentry bundle out of the initial JS payload when telemetry is off.

let initialized = false;

export async function initSentry() {
  if (initialized) return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  initialized = true;
  try {
    const Sentry = await import("@sentry/browser");
    Sentry.init({
      dsn,
      tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "production",
      sendDefaultPii: false,
    });
  } catch (err) {
    console.warn("Sentry init failed:", err);
  }
}
