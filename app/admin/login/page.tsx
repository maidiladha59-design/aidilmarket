import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink-950 px-4">
      <span className="font-display text-xl font-bold text-white mb-6">
        AIDIL<span className="text-signal-400">STORE</span>{" "}
        <span className="text-paper-100/50 font-normal text-sm">Admin</span>
      </span>
      <AdminLoginForm />
    </div>
  );
}
