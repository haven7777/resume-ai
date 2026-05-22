"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setConfirmed(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
      // On success the browser navigates away — leave loading state set.
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] relative overflow-x-hidden flex flex-col" style={{ background: "#F5F3FF" }}>
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }} />
        <div className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, #3B82F6, transparent)" }} />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: "rgba(245,243,255,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(124,58,237,0.1)" }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 rounded-lg">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-extrabold"
              style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)", fontFamily: "var(--font-jakarta)" }}>R</div>
            <span className="font-extrabold text-lg tracking-tight" style={{ fontFamily: "var(--font-jakarta)", color: "#1E1B4B" }}>ResumeAI</span>
          </Link>
        </div>
      </nav>

      {/* Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border shadow-xl p-8 space-y-6"
          style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(16px)", borderColor: "rgba(124,58,237,0.12)" }}>

          {/* Email confirmation screen */}
          {confirmed && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(16,185,129,0.1)" }}>
                <CheckCircle2 size={32} style={{ color: "#10B981" }} />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-jakarta)", color: "#1E1B4B" }}>
                  Check your email
                </h1>
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  We sent a confirmation link to
                </p>
                <p className="text-sm font-semibold" style={{ color: "#1E1B4B" }}>{email}</p>
                <p className="text-xs mt-2" style={{ color: "#9CA3AF" }}>
                  Click the link in the email to activate your account, then sign in.
                </p>
              </div>
              <button
                onClick={() => { setConfirmed(false); setMode("signin"); }}
                className="w-full py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)" }}>
                Back to Sign In
              </button>
            </div>
          )}

          {/* Sign in / sign up form */}
          {!confirmed && (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-jakarta)", color: "#1E1B4B" }}>
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  {mode === "signin" ? "Sign in to access your analyses" : "Start analyzing resumes for free"}
                </p>
              </div>

              <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "rgba(124,58,237,0.15)" }}>
                {(["signin", "signup"] as const).map((m) => (
                  <button key={m} onClick={() => { setMode(m); setError(null); }}
                    className="flex-1 py-2 text-sm font-semibold transition-colors"
                    style={{
                      background: mode === m ? "linear-gradient(135deg, #7C3AED, #3B82F6)" : "transparent",
                      color: mode === m ? "white" : "#6B7280",
                    }}>
                    {m === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              <button onClick={handleGoogle} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border font-semibold text-sm transition-colors hover:bg-white/80 disabled:opacity-60"
                style={{ borderColor: "rgba(124,58,237,0.2)", color: "#1E1B4B", background: "rgba(255,255,255,0.6)" }}>
                {googleLoading ? <Loader2 size={16} className="animate-spin" /> : (
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />
                <span className="text-xs" style={{ color: "#9CA3AF" }}>or continue with email</span>
                <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.1)" }} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#1E1B4B" }}>
                    <Mail size={12} /> Email
                  </label>
                  <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                    style={{ border: "1.5px solid #DDD6FE", background: "rgba(255,255,255,0.9)", color: "#1E1B4B" }} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#1E1B4B" }}>
                    <Lock size={12} /> Password
                  </label>
                  <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                    style={{ border: "1.5px solid #DDD6FE", background: "rgba(255,255,255,0.9)", color: "#1E1B4B" }} />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.07)", color: "#EF4444" }}>
                    <AlertCircle size={13} /> {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)" }}>
                  {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : mode === "signin" ? "Sign In" : "Create Account"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
