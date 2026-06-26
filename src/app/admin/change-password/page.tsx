"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "เปลี่ยนรหัสผ่านไม่สำเร็จ");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("เปลี่ยนรหัสผ่านไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold tracking-tight">Change Password</h1>
      <p className="mt-2 text-sm text-neutral-500">
        กรุณาตั้งรหัสผ่านใหม่ก่อนเข้าใช้งาน Admin
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          id="current-password"
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
        <Input
          id="new-password"
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
        <Input
          id="confirm-password"
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          error={error}
        />
        <p className="text-xs text-neutral-500">
          อย่างน้อย 8 ตัวอักษร และมีตัวเลขอย่างน้อย 1 ตัว
        </p>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
