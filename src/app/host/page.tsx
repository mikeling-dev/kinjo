"use client";
import HostForm from "@/components/HostForm";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function Host() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user?.isHost) {
    return router.push("/host/apply");
  }

  return (
    <div className="flex flex-col justify-center w-full p-4 py-6">
      <div>
        <h1 className="text-xl font-extrabold">Welcome back {user.name}!</h1>
      </div>
    </div>
  );
}
