import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export const metadata = { title: "Reset Password — Forestea" };

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  return (
    <Suspense fallback={null}>
      <ResetPasswordForm token={token ?? null} />
    </Suspense>
  );
}