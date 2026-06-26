"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/ui/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("รหัสผ่านไม่ถูกต้อง");
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="mb-8 text-center">
        <Logo size="lg" href="/" className="mx-auto mb-6" />
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          NELLY Admin
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold">Admin Login</h1>
        <p className="mt-2 text-sm text-neutral-500">
          ใส่รหัสผ่าน Admin เพื่อจัดการสินค้าและตั้งค่า
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="admin-password"
          label="Admin Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          error={error}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
