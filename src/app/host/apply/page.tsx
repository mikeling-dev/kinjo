"use client";
import HostForm from "@/components/HostForm";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function HostApplicationPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return <div>Please login to access this page.</div>;
  }

  if (user.isHost) {
    router.push("/host");
  }

  return (
    <div className="flex flex-col justify-center w-full p-4 py-6">
      <HostForm />
    </div>
  );
}
