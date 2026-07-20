import { AuthForm } from "@/components/auth/AuthForm";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

export default function SignupPage() {
  return (
    <AuthSplitLayout title="Create account">
      <AuthForm mode="signup" />
    </AuthSplitLayout>
  );
}
