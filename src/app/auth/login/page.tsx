import { AuthForm } from "@/components/auth/AuthForm";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return (
    <AuthSplitLayout title="Welcome back">
      <AuthForm mode="login" nextPath={next || "/tour"} />
    </AuthSplitLayout>
  );
}
