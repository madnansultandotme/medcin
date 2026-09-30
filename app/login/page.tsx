"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MedcinLogo } from "@/components/MedcinLogo";
import { useMedcinStore, Role } from "@/lib/store";
import { useBranding } from "@/lib/branding";
import { User, Building2, ShieldCheck, ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as Role) || "patient";

  const { setRole } = useMedcinStore();
  const { branding } = useBranding();
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState("marcus.wei@example.sg");
  const [password, setPassword] = useState("••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const roleCredentials: Record<
    Role,
    { email: string; label: string; sub: string; redirect: string; icon: React.ReactNode }
  > = {
    patient: {
      email: "marcus.wei@example.sg",
      label: "Patient Account",
      sub: "Access consultations & personal health reservations",
      redirect: "/patient",
      icon: <User className="w-4 h-4" />,
    },
    center: {
      email: "appointments@novenamedical.sg",
      label: "Medical Center Practice",
      sub: "Manage clinic roster, doctor slots & incoming appointments",
      redirect: "/center",
      icon: <Building2 className="w-4 h-4" />,
    },
    admin: {
      email: "admin@medcin.asia",
      label: "Platform Admin Console",
      sub: "Platform audits, facility vetting & financial settlements",
      redirect: "/admin",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  };

  useEffect(() => {
    if (initialRole && roleCredentials[initialRole]) {
      setSelectedRole(initialRole);
      setEmail(roleCredentials[initialRole].email);
    }
  }, [initialRole]);

  const handleRoleSelect = (r: Role) => {
    setSelectedRole(r);
    setEmail(roleCredentials[r].email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(selectedRole);
    setLoginSuccess(true);
    setTimeout(() => {
      router.push(roleCredentials[selectedRole].redirect);
    }, 400);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative min-h-[calc(100vh-4rem)] overflow-hidden font-sans-ledger">
      {/* Background Sanctuary Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/bg-sanctuary.jpg')` }}
      />
      <div className="absolute inset-0 bg-[var(--paper)]/85 backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-md backdrop-blur-2xl bg-white/85/90 border border-white/80 p-8 sm:p-10 space-y-6 shadow-2xl rounded-3xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <MedcinLogo size="lg" className="justify-center" />
          <h1 className="text-xl font-bold text-[var(--ink)] tracking-tight">
            Sign In to Your Workspace
          </h1>
          <p className="text-xs text-[var(--muted)] font-mono-ledger">
            Select your account type to access your dedicated dashboard
          </p>
        </div>

        {loginSuccess && (
          <div className="p-3 bg-[var(--paper)] border border-[var(--sage)] text-xs font-mono-ledger text-[var(--sage)] flex items-center gap-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 flex-none" />
            <span>Authenticated successfully. Redirecting to workspace...</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
            Select Account Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["patient", "center", "admin"] as Role[]).map((r) => {
              const info = roleCredentials[r];
              const isSelected = selectedRole === r;
              return (
                <button
                  type="button"
                  key={r}
                  onClick={() => handleRoleSelect(r)}
                  className={`p-3 border text-center text-sm transition-all flex flex-col items-center gap-1.5 rounded-xl ${
                    isSelected
                      ? "border-[var(--clay)] bg-[var(--paper)] text-[var(--clay)] font-bold shadow-xs"
                      : "border-[var(--mist)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  <div className={isSelected ? "text-[var(--clay)]" : "text-[var(--muted)]"}>
                    {info.icon}
                  </div>
                  <span className="capitalize font-semibold">{r === "center" ? "Clinic" : r}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm font-sans-ledger">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 bg-[var(--surface)] border border-[var(--mist)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20 rounded-xl"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert("Password reset instructions sent to your email.")}
                className="text-xs font-semibold text-[var(--clay)] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 bg-[var(--surface)] border border-[var(--mist)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--clay)]/20 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-[var(--muted)] text-xs font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[var(--clay)] rounded"
              />
              <span>Remember this session</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--clay)] text-white font-mono-ledger text-xs font-bold py-3 hover:opacity-95 transition-opacity rounded-xl shadow-md"
          >
            Sign In to {selectedRole === "center" ? "Clinic Workspace" : selectedRole === "admin" ? "Admin Console" : "Patient Portal"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-3 border-t border-[var(--mist)]/70 text-xs text-[var(--muted)] font-mono-ledger">
          <span>New to {branding.client.name}? </span>
          <Link href="/signup" className="text-[var(--clay)] font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center font-mono-ledger text-xs text-[var(--muted)]">
          Loading sign in...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
