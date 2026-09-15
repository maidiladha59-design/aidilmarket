import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; registered?: string; error?: string }>;
}) {
  const { next, registered, error } = await searchParams;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <LoginForm next={next} justRegistered={registered === "1"} oauthError={error} />
    </div>
  );
}
