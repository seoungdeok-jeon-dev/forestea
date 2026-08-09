import { LoginForm } from "@/components/auth/login-form";
import { isGoogleEnabled } from "@/lib/auth-config";
import { Suspense } from "react";

export const metadata = { title: "Log in — Forestea" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm googleEnabled={isGoogleEnabled()} />
    </Suspense>
  );
}
