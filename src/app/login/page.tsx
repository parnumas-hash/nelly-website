"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageTransition from "@/components/ui/PageTransition";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      router.push("/shop");
    } else {
      setError("Invalid credentials. Password must be at least 6 characters.");
    }
  };

  if (isAuthenticated && user) {
    return (
      <PageTransition>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full rounded-3xl border border-neutral-200 p-8 text-center dark:border-neutral-800"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {user.name.charAt(0)}
            </div>
            <h1 className="font-display text-2xl font-bold">
              Welcome, {user.name}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">{user.email}</p>
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/shop">
                <Button className="w-full">Continue Shopping</Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 md:px-6">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="xl" href="/" className="mb-6" />
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Account
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Access your NELLY GROUP account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={error}
          />
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Demo: use any email and a password with 6+ characters
        </p>
      </div>
    </PageTransition>
  );
}
