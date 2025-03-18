"use client";
import HostListings from "@/components/HostListings";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function Host() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user?.isHost) {
    return router.push("/host/apply");
  }

  return (
    <div className="flex flex-col justify-center w-full py-6">
      <div className="px-4">
        <h1 className="text-xl font-extrabold mb-4 ">
          Welcome back {user.name}!
        </h1>
      </div>
      <HostListings />
    </div>
  );
}
