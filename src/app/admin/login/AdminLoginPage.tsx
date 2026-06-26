"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/ui/Logo";
import { isRemoteCatalogEnabled } from "@/lib/admin/catalog-sync";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";
  const cloudMode = isRemoteCatalogEnabled();
  const [username, setUsername] = useState("");
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
        body: JSON.stringify({
          username: cloudMode ? username : username || undefined,
          password,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        mustChangePassword?: boolean;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      if (data?.mustChangePassword) {
        router.replace("/admin/change-password");
      } else {
        router.replace(nextPath);
      }
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
          {cloudMode
            ? "เข้าสู่ระบบด้วยบัญชีที่ Super Admin สร้างให้"
            : "ใส่รหัสผ่าน Admin เพื่อจัดการสินค้าและตั้งค่า"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {cloudMode ? (
          <Input
            id="admin-username"
            label="Username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        ) : null}
        <Input
          id="admin-password"
          label={cloudMode ? "Password" : "Admin Password"}
          type="password"
          autoComplete="current-password"
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
