import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export const metadata = { title: "Reset Password — Forestea" };

function ResetPasswordContent() {
  // Get token from URL search params
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    return <ResetPasswordForm token={token} />;
  }
  return <ResetPasswordForm token={null} />;
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm token={searchParams.token ?? null} />
    </Suspense>
  );
}
