import { SignupForm } from "@/components/auth/signup-form";
import { isGoogleEnabled } from "@/lib/auth-config";

export const metadata = { title: "Sign up — Forestea" };

export default function SignupPage() {
  return <SignupForm googleEnabled={isGoogleEnabled()} />;
}
